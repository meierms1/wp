#!/usr/bin/env bash
# Automated setup script for Flask backend + React frontend
# Idempotent: safe to re-run. Creates Python venv, installs requirements, sets up/builds React app.

set -Eeuo pipefail
IFS=$'\n\t'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PY_ENV_DIR="${PROJECT_ROOT}/.venv"
REQ_FILE="${PROJECT_ROOT}/requirements.txt"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"

COLOR_BLUE="\033[1;34m"
COLOR_GREEN="\033[1;32m"
COLOR_YELLOW="\033[1;33m"
COLOR_RED="\033[1;31m"
COLOR_RESET="\033[0m"

log() { echo -e "${COLOR_BLUE}[INFO]${COLOR_RESET} $*"; }
ok() { echo -e "${COLOR_GREEN}[OK]${COLOR_RESET} $*"; }
warn() { echo -e "${COLOR_YELLOW}[WARN]${COLOR_RESET} $*"; }
err() { echo -e "${COLOR_RED}[ERROR]${COLOR_RESET} $*" >&2; }

check_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    return 1
  fi
  return 0
}

require_command() {
  if ! check_command "$1"; then
    err "Required command '$1' not found. Please install it and re-run."
    exit 1
  fi
}

version_ge() { # usage: version_ge 3.10 3.9.18
  # returns 0 if $1 >= $2
  printf '%s\n%s\n' "$1" "$2" | sort -V | head -n1 | grep -qx "$2"
}

log "Checking Python installation..."
if check_command python3; then
  PYTHON_BIN="python3"
elif check_command python; then
  PYTHON_BIN="python"
else
  err "Python is not installed. Install Python 3.10+ and re-run."
  exit 1
fi

PY_VER="$($PYTHON_BIN -c 'import sys; print("%d.%d"%sys.version_info[:2])')"
REQ_VER="3.9"  # minimal, but recommend 3.10+
if ! version_ge "$PY_VER" "$REQ_VER"; then
  warn "Detected Python $PY_VER (< $REQ_VER). Some dependencies may require a newer version (recommend 3.10+)."
fi
ok "Python found: $PY_VER ($PYTHON_BIN)"

log "Creating / activating virtual environment..."
if [[ ! -d "$PY_ENV_DIR" ]]; then
  $PYTHON_BIN -m venv "$PY_ENV_DIR"
  ok "Virtual environment created at $PY_ENV_DIR"
else
  ok "Virtual environment already exists"
fi

# shellcheck disable=SC1091
source "$PY_ENV_DIR/bin/activate"

log "Upgrading pip/setuptools/wheel..."
pip install --upgrade pip setuptools wheel >/dev/null
ok "Base Python tooling upgraded"

log "Installing backend Python dependencies..."
if [[ -f "$REQ_FILE" ]]; then
  pip install -r "$REQ_FILE"
else
  warn "requirements.txt not found; installing core fallback packages"
  pip install Flask Flask-Login Flask-SQLAlchemy Flask-WTF Flask-Mail Flask-Caching WTForms SQLAlchemy gunicorn yfinance numpy pandas requests flask-cors
fi
ok "Backend dependencies installed"

# Write a .env sample if not present
ENV_FILE="$PROJECT_ROOT/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  cat > "$ENV_FILE" <<'EOF'
# Environment variables (edit values as needed)
FLASK_DEBUG=True
SECRET_KEY=change-this
DATABASE_URL=sqlite:///database2.db
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=465
MAIL_USE_SSL=True
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=app_password_here
DEBUG_AUTH=0
EOF
  ok ".env template created"
else
  log ".env already exists (skipped creation)"
fi

########################################
# React Frontend Setup
########################################
log "Checking Node.js / npm availability..."
if check_command node && check_command npm; then
  NODE_VER="$(node -v)"; NPM_VER="$(npm -v)"; ok "Node $NODE_VER / npm $NPM_VER detected"
else
  warn "Node.js and npm not found. Skipping React setup. Install Node.js (v18+) and re-run to build frontend."
  FRONTEND_SKIP=1
fi

if [[ -z "${FRONTEND_SKIP:-}" ]]; then
  if [[ ! -d "$FRONTEND_DIR" ]]; then
    log "Creating React app (Vite) in '$FRONTEND_DIR'..."
    # Use npm create (interactive flags suppressed)
    npm create vite@latest "$FRONTEND_DIR" -- --template react >/dev/null 2>&1 || {
      err "Vite project creation failed"; exit 1; }
    ok "React scaffold created"
  else
    log "Frontend directory already exists; skipping scaffold"
  fi

  pushd "$FRONTEND_DIR" >/dev/null

  # Ensure required dependencies (adds if missing)
  log "Installing React dependencies..."
  npm install >/dev/null 2>&1 || { err "npm install failed"; exit 1; }

  # Core SPA deps for this project
  REQUIRED_PKGS=(axios react-router-dom react-hot-toast framer-motion @heroicons/react react-plotly.js plotly.js)
  ADDED=()
  for pkg in "${REQUIRED_PKGS[@]}"; do
    if ! grep -q "\"$pkg\"" package.json; then
      ADDED+=("$pkg")
    fi
  done
  if (( ${#ADDED[@]} )); then
    log "Adding missing packages: ${ADDED[*]}"
    npm install "${ADDED[@]}" >/dev/null 2>&1 || { err "Failed installing some React packages"; exit 1; }
  else
    log "All required React packages already present"
  fi

  # Optional build step
  log "Building production React bundle..."
  if npm run build >/dev/null 2>&1; then
    ok "React build completed (dist/)"
  else
    warn "React build failed (you can inspect errors manually)"
  fi

  popd >/dev/null
fi

########################################
# Post-setup summary
########################################
ok "Setup complete"
cat <<SUMMARY
--------------------------------------------------
Backend virtualenv: $PY_ENV_DIR
Activate with: source $PY_ENV_DIR/bin/activate
Run Flask (dev):   flask --app backend.app run --debug
React dev server:  cd frontend && npm run dev
React build dir:   frontend/dist (if build succeeded)
Environment file:  .env (edit before production)
--------------------------------------------------
SUMMARY
