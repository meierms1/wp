# Multi-stage build: React (Vite or CRA) frontend + Flask backend
# Final image: python:3.11-slim serving Flask via Gunicorn

############################
# Stage 1: Frontend build  #
############################
FROM node:20-alpine AS frontend-build
WORKDIR /app
# Copy frontend directory
COPY frontend ./frontend
# Build React frontend
RUN if [ -d frontend ] && [ -f frontend/package.json ]; then \
      echo "Building React frontend" && \
      cd frontend && \
      npm ci && \
      npm run build && \
      echo "Frontend build completed" && \
      ls -la build/ && \
      mv build ../frontend_output; \
    else \
      echo "Skipping React build (frontend folder or package.json missing)"; \
      mkdir -p /app/frontend_output && \
      echo '<!DOCTYPE html><html><head><title>No Build</title></head><body><h1>Frontend build missing</h1></body></html>' > /app/frontend_output/index.html; \
    fi

############################
# Stage 2: Backend image   #
############################
FROM python:3.12-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev libjpeg-dev zlib1g-dev curl \
  && rm -rf /var/lib/apt/lists/*
# Dependency install first for caching
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt
# Copy frontend build from stage 1
COPY --from=frontend-build /app/frontend_output ./static/frontend
# Copy full context (lighter because we will add a .dockerignore soon)
COPY . .
# Ensure frontend build is in the right place
RUN if [ -d static/frontend ] && [ -f static/frontend/index.html ]; then \
      echo "Frontend build found in static/frontend"; \
    else \
      echo "WARNING: Frontend build not found - creating placeholder"; \
      mkdir -p static/frontend && \
      echo '<!DOCTYPE html><html><body><h1>Frontend build missing</h1></body></html>' > static/frontend/index.html; \
    fi
# Expose port (dynamic for cloud deployment)
EXPOSE 8080
# Non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser
ENV FLASK_DEBUG=False HOST=0.0.0.0 SESSION_COOKIE_SECURE=True SESSION_COOKIE_SAMESITE=None
# Bind to $PORT environment variable (fallback to 8080)
CMD ["sh", "-c", "gunicorn -b 0.0.0.0:${PORT:-8080} backend.app:app --workers 2 --threads 2 --timeout 120"]
