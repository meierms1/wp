#!/usr/bin/env bash
# Launch both Flask backend (with auto-reload) and React (CRA) frontend.
# Assumes bash_build.sh was run (venv + deps + frontend scaffold).
# Safe to re-run; will revive processes after crashes until script exits.

set -Eeuo pipefail
IFS=$'\n\t'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$PROJECT_ROOT/.venv"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
FLASK_APP_MODULE="backend.app"
FLASK_PORT=${FLASK_PORT:-5000}
REACT_PORT=${REACT_PORT:-3000}

COLOR_BLUE="\033[1;34m"; COLOR_GREEN="\033[1;32m"; COLOR_RED="\033[1;31m"; COLOR_YELLOW="\033[1;33m"; COLOR_RESET="\033[0m"
log(){ echo -e "${COLOR_BLUE}[INFO]${COLOR_RESET} $*"; }
ok(){ echo -e "${COLOR_GREEN}[OK]${COLOR_RESET} $*"; }
warn(){ echo -e "${COLOR_YELLOW}[WARN]${COLOR_RESET} $*"; }
err(){ echo -e "${COLOR_RED}[ERR]${COLOR_RESET} $*" >&2; }

check(){ command -v "$1" >/dev/null 2>&1; }

if [[ ! -d "$VENV_DIR" ]]; then
  err "Virtual environment not found at $VENV_DIR. Run ./bash_build.sh first."; exit 1
fi
# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

if ! python -c 'import flask' >/dev/null 2>&1; then
  err "Flask not installed in venv. Run ./bash_build.sh again."; exit 1
fi

if [[ ! -d "$FRONTEND_DIR" ]]; then
  warn "Frontend directory missing; creating a minimal Vite React app..."
  if check node && check npm; then
    npm create react-app "$FRONTEND_DIR" >/dev/null 2>&1 || err "Failed to scaffold React"
  else
    err "Node.js/npm not installed and frontend missing. Install Node.js or run bash_build.sh."; exit 1
  fi
fi

if ! check node || ! check npm; then
  warn "Node or npm not found; starting ONLY Flask backend."
  ONLY_BACKEND=1
fi

cd "$PROJECT_ROOT"

export FLASK_APP="$FLASK_APP_MODULE"
export FLASK_RUN_PORT="$FLASK_PORT"
export FLASK_ENV=development
# Load optional .env if present (non-exported vars ignored)
if [[ -f .env ]]; then
  set -a; source .env; set +a
fi

# Ensure CORS_ORIGINS contains React dev origin
REACT_ORIGIN="http://localhost:${REACT_PORT}"
if [[ "${CORS_ORIGINS:-}" != *"$REACT_ORIGIN"* ]]; then
  export CORS_ORIGINS="${CORS_ORIGINS:+$CORS_ORIGINS,}$REACT_ORIGIN"
fi

FRONTEND_PID=""

start_react(){
  [[ -n "${ONLY_BACKEND:-}" ]] && return 0
  cd "$FRONTEND_DIR"
  if [[ ! -d node_modules ]]; then
    log "Installing frontend dependencies..."
    npm install || { err "npm install failed"; cd "$PROJECT_ROOT"; return 1; }
  fi
  log "Starting React dev server on :$REACT_PORT"
  # Use nohup to decouple from potential flask reload exec events  
  PORT=$REACT_PORT nohup npm start >/dev/null 2>&1 &
  FRONTEND_PID=$!
  cd "$PROJECT_ROOT"
}

start_flask(){
  log "Starting Flask backend on :$FLASK_PORT (module $FLASK_APP)"
  # Run in foreground so that flask's reloader restarts don't terminate the whole script prematurely
  python -m flask run --reload
}

cleanup(){
  log "Cleaning up..."
  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
    kill "$FRONTEND_PID" 2>/dev/null || true
    wait "$FRONTEND_PID" 2>/dev/null || true
  fi
  ok "Shutdown complete"
}
trap cleanup EXIT INT TERM

start_react

# Print URLs early
ok "Services launching..."
echo -e "${COLOR_GREEN}Backend: http://localhost:${FLASK_PORT}${COLOR_RESET}"
if [[ -z "${ONLY_BACKEND:-}" ]]; then
  echo -e "${COLOR_GREEN}Frontend: http://localhost:${REACT_PORT}${COLOR_RESET}"
fi

echo -e "${COLOR_BLUE}Press Ctrl+C to stop (Flask in foreground).${COLOR_RESET}"

# Run Flask (blocks). When it exits (Ctrl+C), cleanup hook will terminate React.
start_flask
