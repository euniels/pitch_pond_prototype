#!/bin/sh
set -eu

mkdir -p /run/clamav /var/lib/clamav
chown -R clamav:clamav /run/clamav /var/lib/clamav

if [ ! -f /var/lib/clamav/main.cvd ] && [ ! -f /var/lib/clamav/main.cld ]; then
  freshclam --stdout || true
fi

cat > /etc/clamav/clamd.conf <<'EOF'
Foreground true
User clamav
TCPSocket 3310
TCPAddr 127.0.0.1
MaxFileSize 10M
MaxScanSize 10M
StreamMaxLength 10M
ReadTimeout 30
CommandReadTimeout 30
LogTime true
LogClean false
EOF

freshclam --daemon --foreground=true &
freshclam_pid=$!
clamd --foreground=true &
clamd_pid=$!

cleanup() {
  kill "$clamd_pid" 2>/dev/null || true
  kill "$freshclam_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

attempt=0
until printf 'zPING\0' | nc -w 2 127.0.0.1 3310 2>/dev/null | grep -q PONG; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 60 ]; then
    echo "ClamAV did not become ready." >&2
    exit 1
  fi
  sleep 2
done

exec node /app/server.mjs
