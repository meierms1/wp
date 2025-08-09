# Multi-stage build: React (Vite) frontend + Flask backend
# Final image: python:3.11-slim serving Flask via Gunicorn

############################
# Stage 1: Frontend build  #
############################
FROM node:20-alpine AS frontend-build
WORKDIR /app
# Only copy frontend to leverage Docker layer caching
COPY frontend ./frontend
# Install and build if frontend exists
RUN if [ -d frontend ]; then \
      cd frontend && \
      npm install && \
      npm run build; \
    else \
      echo "No frontend directory present; skipping React build"; \
    fi

############################
# Stage 2: Backend image   #
############################
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps (psycopg2, build tools for any wheels) then remove build tools after install
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
  && rm -rf /var/lib/apt/lists/*

# Copy dependency list first for caching
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy backend + static assets
COPY backend ./backend
COPY static ./static
COPY templates ./templates

# Copy React build output (if it was built) into static directory
# (Flask is configured with static_folder=/static)
COPY --from=frontend-build /app/frontend/dist ./static/frontend

# Optional: copy any ancillary root files you need (e.g., FIRE2.json)
COPY FIRE2.json* ./ || true

# Expose port
EXPOSE 5000

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Environment defaults (override in deployment)
ENV FLASK_DEBUG=False \
    PORT=5000 \
    HOST=0.0.0.0 \
    SESSION_COOKIE_SECURE=True \
    SESSION_COOKIE_SAMESITE=None

# Gunicorn config: 3 workers (adjust for CPU), threads=4 for some concurrency
# Bind to 0.0.0.0:5000
CMD ["gunicorn", "-b", "0.0.0.0:5000", "backend.app:app", "--workers", "3", "--threads", "4", "--timeout", "120"]
