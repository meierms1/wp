# Multi-stage build: React (CRA) frontend + Flask backend
# Final image: python:3.12-slim serving Flask via Gunicorn

############################
# Stage 1: Frontend build  #
############################
FROM node:20-alpine AS frontend-build
WORKDIR /app
# Copy frontend directory
COPY frontend ./frontend
# Debug: Show what we copied
RUN echo "=== Frontend directory contents ===" && ls -la frontend/ || echo "Frontend directory missing"
# Build React frontend
RUN if [ -d frontend ] && [ -f frontend/package.json ]; then \
      echo "=== Building React frontend ===" && \
      cd frontend && \
      echo "Installing dependencies..." && \
      if [ -f package-lock.json ]; then \
        npm ci; \
      else \
        echo "No package-lock.json found, using npm install..." && \
        npm install; \
      fi && \
      echo "Running build..." && \
      npm run build && \
      echo "=== Frontend build completed ===" && \
      ls -la build/ && \
      echo "Moving build to frontend_output..." && \
      mv build ../frontend_output && \
      echo "=== Build moved successfully ===" && \
      ls -la ../frontend_output/; \
    else \
      echo "=== Skipping React build (frontend folder or package.json missing) ===" && \
      mkdir -p /app/frontend_output && \
      echo '<!DOCTYPE html><html><head><title>No Build</title></head><body><h1>Frontend build missing</h1><p>Check build logs for details</p></body></html>' > /app/frontend_output/index.html; \
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
RUN echo "=== Checking frontend build ===" && \
    if [ -d static/frontend ] && [ -f static/frontend/index.html ]; then \
      echo "✅ Frontend build found in static/frontend" && \
      ls -la static/frontend/ | head -10; \
    else \
      echo "❌ WARNING: Frontend build not found - creating placeholder" && \
      mkdir -p static/frontend && \
      echo '<!DOCTYPE html><html><body><h1>Frontend build missing</h1></body></html>' > static/frontend/index.html; \
    fi

# Copy media files from React build to Flask static directory for proper serving
RUN echo "=== Copying media files to Flask static directory ===" && \
    if [ -d static/frontend/static ]; then \
      cp static/frontend/static/*.gif static/ 2>/dev/null || echo "No .gif files to copy" && \
      cp static/frontend/static/*.png static/ 2>/dev/null || echo "No .png files to copy" && \
      cp static/frontend/static/*.jpg static/ 2>/dev/null || echo "No .jpg files to copy" && \
      cp static/frontend/static/*.jpeg static/ 2>/dev/null || echo "No .jpeg files to copy" && \
      cp static/frontend/static/*.webp static/ 2>/dev/null || echo "No .webp files to copy" && \
      cp static/frontend/static/*.webm static/ 2>/dev/null || echo "No .webm files to copy" && \
      cp static/frontend/static/*.mp4 static/ 2>/dev/null || echo "No .mp4 files to copy" && \
      cp static/frontend/static/*.pdf static/ 2>/dev/null || echo "No .pdf files to copy" && \
      echo "✅ Media files copied to static directory" && \
      ls -la static/*.{gif,png,jpg,jpeg,webp,webm,mp4,pdf} 2>/dev/null | head -10 || echo "Media files check complete"; \
    else \
      echo "❌ No React static directory found, skipping media copy"; \
    fi
# Expose port (dynamic for cloud deployment)
EXPOSE 8080
# Copy startup script
COPY start.sh ./start.sh
RUN chmod +x start.sh
# Non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser
ENV FLASK_DEBUG=False HOST=0.0.0.0 SESSION_COOKIE_SECURE=True SESSION_COOKIE_SAMESITE=None
# Use startup script for proper port binding
CMD ["./start.sh"]
