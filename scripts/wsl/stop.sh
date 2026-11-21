#!/usr/bin/env bash
# Stop the API, the web app and Mailpit, and close the log terminals that start.sh opened.
#
#   bash scripts/wsl/stop.sh
set -euo pipefail

systemctl --user stop se050-api se050-web mailpit.service 2>/dev/null || true
# The log terminals notice their server has stopped and close; this closes them straight away.
pkill -u "$(id -u)" -f "scripts/wsl/follow.sh (api|web|mail)$" || true
echo "Stopped the API, the web app and Mailpit, and closed their log terminals."
echo "Mailpit starts again with WSL, or with: bash scripts/wsl/start.sh"
