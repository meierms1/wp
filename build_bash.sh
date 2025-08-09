#!/usr/bin/env bash
# Compatibility wrapper for platforms expecting build_bash.sh
# Your real setup script is bash_build.sh
# In container builds you usually DO NOT want a venv (layer duplication),
# but this preserves existing behavior. Adjust Dockerfile later for a
# lean production image using requirements.txt directly.

set -euo pipefail

if [[ ! -f bash_build.sh ]]; then
  echo "bash_build.sh not found at project root" >&2
  exit 1
fi

bash ./bash_build.sh
