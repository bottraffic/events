#!/usr/bin/env bash
#
# SIMCHA OS — one-command deploy for Ubuntu 22.04/24.04 (Hetzner / any VPS)
# ---------------------------------------------------------------------------
# Usage (run AS ROOT on the server):
#
#   GH_TOKEN=ghp_xxx DOMAIN=app.example.com EMAIL=you@example.com bash deploy.sh
#
#   - GH_TOKEN : a GitHub token with read access to bottraffic/events (required
#                only if the repo is private; omit for a public repo)
#   - DOMAIN   : your domain pointed at this server (optional; if omitted the
#                site is served on the server IP over plain HTTP, port 80)
#   - EMAIL    : email for Let's Encrypt (only used when DOMAIN is set)
#
# Re-running this script safely updates an existing install (git pull + rebuild).
# ---------------------------------------------------------------------------
set -euo pipefail

REPO="${REPO:-bottraffic/events}"
APP_DIR="/opt/simcha-os"
WEB_DIR="$APP_DIR/apps/web"
NODE_MAJOR=20

log(){ printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
die(){ printf '\n\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" = "0" ] || die "Run as root (sudo bash deploy.sh)"

# ---------------------------------------------------------------------------
log "1/8  System packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git ca-certificates ufw

# ---------------------------------------------------------------------------
log "2/8  Node.js ${NODE_MAJOR}.x"
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -c2- | cut -d. -f1)" -lt "$NODE_MAJOR" ]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi
node -v && npm -v

# ---------------------------------------------------------------------------
log "3/8  PM2 + nginx"
command -v pm2  >/dev/null 2>&1 || npm install -g pm2
command -v nginx >/dev/null 2>&1 || apt-get install -y nginx

# ---------------------------------------------------------------------------
log "4/8  Fetch source ($REPO)"
if [ -n "${GH_TOKEN:-}" ]; then
  CLONE_URL="https://${GH_TOKEN}@github.com/${REPO}.git"
else
  CLONE_URL="https://github.com/${REPO}.git"
fi
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" remote set-url origin "$CLONE_URL"
  git -C "$APP_DIR" fetch --depth 1 origin main
  git -C "$APP_DIR" reset --hard origin/main
else
  git clone --depth 1 "$CLONE_URL" "$APP_DIR"
fi
# scrub token from stored remote
git -C "$APP_DIR" remote set-url origin "https://github.com/${REPO}.git"

# ---------------------------------------------------------------------------
log "5/8  Install deps + build web (DEMO mode)"
cd "$WEB_DIR"
# the web app is self-contained in demo mode; install only its deps
npm install --no-workspaces --no-audit --no-fund
echo "NEXT_PUBLIC_DEMO=1" > "$WEB_DIR/.env.production"
NEXT_PUBLIC_DEMO=1 npm run build

# ---------------------------------------------------------------------------
log "6/8  Start with PM2 (port 3000)"
cd "$WEB_DIR"
pm2 delete simcha-web >/dev/null 2>&1 || true
NEXT_PUBLIC_DEMO=1 PORT=3000 pm2 start npm --name simcha-web -- run start
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

# ---------------------------------------------------------------------------
log "7/8  nginx reverse proxy"
SERVER_NAME="${DOMAIN:-_}"
cat >/etc/nginx/sites-available/simcha <<NGINX
server {
    listen 80;
    server_name ${SERVER_NAME};
    client_max_body_size 25m;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/simcha /etc/nginx/sites-enabled/simcha
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# firewall
ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow 'Nginx Full' >/dev/null 2>&1 || true
yes | ufw enable >/dev/null 2>&1 || true

# ---------------------------------------------------------------------------
log "8/8  SSL"
if [ -n "${DOMAIN:-}" ]; then
  apt-get install -y certbot python3-certbot-nginx
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos \
    -m "${EMAIL:-admin@$DOMAIN}" --redirect || \
    echo "certbot failed (check DNS A-record for $DOMAIN -> this server). Site still served on HTTP."
else
  echo "No DOMAIN set — skipping SSL. Site served on plain HTTP."
fi

# ---------------------------------------------------------------------------
IP=$(curl -fsS https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')
log "DONE ✅"
echo "Local health check:"
sleep 2
curl -fsS -o /dev/null -w "  http://127.0.0.1:3000  ->  HTTP %{http_code}\n" http://127.0.0.1:3000 || echo "  app not responding yet — run: pm2 logs simcha-web"
echo
if [ -n "${DOMAIN:-}" ]; then echo "Open:  https://${DOMAIN}"; else echo "Open:  http://${IP}"; fi
echo "Manage: pm2 status | pm2 logs simcha-web | pm2 restart simcha-web"
