#!/usr/bin/env bash
# Helper script to build and run the app container defined by Dockerfile.
# Usage:
#   ./run_docker.sh            (build + run)
#   ./run_docker.sh build       (only build)
#   ./run_docker.sh run         (run existing image)
#   PORT=8080 ./run_docker.sh   (override host port)
#   ./run_docker.sh shell       (open /bin/bash in a disposable container)

set -euo pipefail
IFS=$'\n\t'

IMAGE_NAME="wp-app"
IMAGE_TAG="latest"
CONTAINER_NAME="wp-app-dev"
HOST_PORT=${PORT:-5000}
CONTAINER_PORT=5000
ENV_FILE=".env"

COLOR_GREEN='\033[1;32m'; COLOR_RED='\033[1;31m'; COLOR_BLUE='\033[1;34m'; COLOR_YELLOW='\033[1;33m'; COLOR_RESET='\033[0m'
log(){ echo -e "${COLOR_BLUE}[INFO]${COLOR_RESET} $*"; }
ok(){ echo -e "${COLOR_GREEN}[OK]${COLOR_RESET} $*"; }
err(){ echo -e "${COLOR_RED}[ERR]${COLOR_RESET} $*" >&2; }
warn(){ echo -e "${COLOR_YELLOW}[WARN]${COLOR_RESET} $*"; }

need(){ command -v "$1" >/dev/null 2>&1 || { err "Missing dependency: $1"; exit 1; }; }

need docker

ACTION=${1:-all}

build_image(){
  log "Building image ${IMAGE_NAME}:${IMAGE_TAG}"
  docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .
  ok "Image built"
}

stop_existing(){
  if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log "Removing existing container ${CONTAINER_NAME}";
    docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
  fi
}

run_container(){
  stop_existing
  local env_args=()
  if [[ -f "$ENV_FILE" ]]; then
    env_args+=(--env-file "$ENV_FILE")
  else
    warn ".env not found; running without external env file"
  fi
  log "Starting container on http://localhost:${HOST_PORT} -> ${CONTAINER_PORT}"
  docker run -it --name "$CONTAINER_NAME" -p "${HOST_PORT}:${CONTAINER_PORT}" "${env_args[@]}" "${IMAGE_NAME}:${IMAGE_TAG}"
}

shell_container(){
  build_image
  log "Opening interactive shell in fresh container"
  docker run --rm -it "${IMAGE_NAME}:${IMAGE_TAG}" /bin/bash || true
}

case "$ACTION" in
  build)
    build_image ;;
  run)
    run_container ;;
  shell)
    shell_container ;;
  all|*)
    build_image
    run_container ;;
endcase
