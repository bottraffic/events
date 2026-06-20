#!/usr/bin/env bash
# SIMCHA OS — backend infra deploy (MySQL + Redis + NestJS API) on Ubuntu.
# Idempotent: safe to re-run to update the API. Run as root on the server.
#   bash deploy-backend.sh
set -euo pipefail
APP=/opt/simcha-os
cd "$APP"

echo "==> latest code"
git fetch --depth 1 origin main && git reset --hard origin/main

echo "==> docker"
command -v docker >/dev/null 2>&1 || curl -fsSL https://get.docker.com | sh
mkdir -p /opt/simcha-data/mysql /opt/simcha-data/redis

echo "==> secrets (generated once, persisted)"
if [ ! -f "$APP/.svc.env" ]; then
  printf 'MYSQL_PASSWORD=%s\nJWT_SECRET=%s\n' "$(openssl rand -hex 16)" "$(openssl rand -hex 32)" > "$APP/.svc.env"
  chmod 600 "$APP/.svc.env"
fi
# dedicated operator console key (separate from JWT signing secret)
grep -q '^PLATFORM_KEY=' "$APP/.svc.env" || echo "PLATFORM_KEY=$(openssl rand -hex 16)" >> "$APP/.svc.env"
. "$APP/.svc.env"

echo "==> MySQL + Redis containers"
cat > "$APP/docker-compose.db.yml" <<EOF
services:
  mysql:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_DATABASE: simcha
    command: ["--character-set-server=utf8mb4","--collation-server=utf8mb4_unicode_ci"]
    volumes: ["/opt/simcha-data/mysql:/var/lib/mysql"]
    ports: ["127.0.0.1:3306:3306"]
  redis:
    image: redis:7-alpine
    restart: always
    command: ["redis-server","--save","60","1"]
    volumes: ["/opt/simcha-data/redis:/data"]
    ports: ["127.0.0.1:6379:6379"]
EOF
docker compose -f "$APP/docker-compose.db.yml" up -d
for i in $(seq 1 40); do
  docker compose -f "$APP/docker-compose.db.yml" exec -T mysql mysqladmin ping -uroot -p"${MYSQL_PASSWORD}" >/dev/null 2>&1 && break || sleep 2
done

export DATABASE_URL="mysql://root:${MYSQL_PASSWORD}@127.0.0.1:3306/simcha"

echo "==> install workspaces (api + db)"
npm install -w packages/db -w apps/api --no-audit --no-fund
echo "==> prisma generate + db push"
npm -w packages/db run generate
( cd packages/db && DATABASE_URL="$DATABASE_URL" npx prisma db push --skip-generate )
( cd packages/db && npx tsc ) || true
echo "==> seed (idempotent upserts)"
( cd packages/db && DATABASE_URL="$DATABASE_URL" npx ts-node prisma/seed.ts ) || true
echo "==> build API"
npm -w apps/api run build

echo "==> (re)start API on PM2 (localhost:4000)"
cd "$APP/apps/api"
pm2 delete simcha-api >/dev/null 2>&1 || true
DATABASE_URL="$DATABASE_URL" JWT_SECRET="${JWT_SECRET}" PLATFORM_KEY="${PLATFORM_KEY}" REDIS_URL="redis://127.0.0.1:6379" \
  NODE_ENV=production PORT=4000 HOST=127.0.0.1 CORS_ORIGIN="https://events.webon.org.il,http://localhost:3000" \
  pm2 start dist/main.js --name simcha-api
pm2 save
sleep 3
curl -fsS -o /dev/null -w "API /v1/health -> %{http_code}\n" http://127.0.0.1:4000/v1/health
echo "==> backend deploy done"
