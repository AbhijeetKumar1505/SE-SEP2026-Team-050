# shellcheck shell=bash
# Start-up file for the "WSL" terminal in .vscode/settings.json:
# your usual bash set-up, plus the project's Python environment, so flask, pytest and ruff work directly.
# shellcheck source=/dev/null
[ -f ~/.bashrc ] && . ~/.bashrc
SE050_VENV="${SE050_VENV:-$HOME/.venvs/se-sep2026-team-050}"
if [ -f "$SE050_VENV/bin/activate" ]; then
  # shellcheck source=/dev/null
  . "$SE050_VENV/bin/activate"
else
  echo "No Python environment in $SE050_VENV yet. Run: bash scripts/wsl/setup.sh"
fi
