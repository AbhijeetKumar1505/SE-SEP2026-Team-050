#!/usr/bin/env bash
# Show one dev server's log live, until the server stops. start.sh opens one terminal per server
# running this; it exits cleanly when stop.sh stops the server, so the terminal closes.
#
#   bash scripts/wsl/follow.sh api|web|mail
set -uo pipefail

case "${1:-}" in
  api) unit=se050-api title="API (Flask)" ;;
  web) unit=se050-web title="Web app (Vite)" ;;
  mail) unit=mailpit title="Mailpit" ;;
  *) echo "Use: bash scripts/wsl/follow.sh api|web|mail" >&2; exit 2 ;;
esac

printf '\033]0;%s\007' "$title"  # terminal title
echo "== $title: live log of $unit. Closing this terminal leaves the server running. =="

journalctl --user --unit "$unit" --follow --lines 40 --output cat &
follower=$!
stop_following() { kill "$follower" 2>/dev/null; wait "$follower" 2>/dev/null; }
trap 'stop_following; exit 0' TERM INT HUP

# Keep following while the server runs. A gap of a few seconds while it restarts is not a stop.
idle=0
while [ "$idle" -lt 5 ]; do
  sleep 1
  if systemctl --user is-active --quiet "$unit"; then idle=0; else idle=$((idle + 1)); fi
done
stop_following
echo "== $unit has stopped. This terminal closes in 3 seconds. =="
sleep 3
exit 0
