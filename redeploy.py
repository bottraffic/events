#!/usr/bin/env python
"""SIMCHA OS — redeploy latest main to the Hetzner server and verify it's live.
Usage: python redeploy.py
Requires: paramiko, SSH key at C:\\Users\\WebON\\.ssh\\simcha_deploy (in server authorized_keys).
"""
import os, sys, paramiko

IP = "167.233.18.110"
KEY_PATH = os.path.expanduser(r"~\.ssh\simcha_deploy")

SCRIPT = (
    "set -e; cd /opt/simcha-os && "
    "git fetch --depth 1 origin main && git reset --hard origin/main && "
    "cd apps/web && npm install --no-workspaces --no-audit --no-fund >/dev/null 2>&1 && "
    "NEXT_PUBLIC_DEMO=1 npm run build && pm2 restart simcha-web && sleep 2 && "
    "curl -fsS -o /dev/null -w 'LOCAL http %{http_code}\\n' http://127.0.0.1:3000"
)

def main():
    key = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
    c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(IP, username="root", pkey=key, timeout=15, look_for_keys=False, allow_agent=False)
    ch = c.get_transport().open_session(); ch.get_pty(); ch.exec_command(SCRIPT)
    while True:
        if ch.recv_ready():
            sys.stdout.buffer.write(ch.recv(4096)); sys.stdout.flush()
        if ch.exit_status_ready() and not ch.recv_ready():
            break
    rc = ch.recv_exit_status()
    while ch.recv_ready():
        sys.stdout.buffer.write(ch.recv(4096))
    sys.stdout.flush(); print(f"\n=== EXIT {rc} ===")
    c.close(); sys.exit(rc)

if __name__ == "__main__":
    main()
