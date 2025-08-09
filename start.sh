#!/bin/bash
# Startup script to ensure proper port binding for Cloud Run

# Set default port if not provided
export PORT=${PORT:-8080}

echo "=== Starting application ==="
echo "Binding to port: $PORT"
echo "Workers: 2, Threads: 2"
echo "============================"

# Start Gunicorn
exec gunicorn -b 0.0.0.0:$PORT backend.app:app --workers 2 --threads 2 --timeout 120 --access-logfile - --error-logfile -
