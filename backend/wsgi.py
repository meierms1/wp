#!/usr/bin/env python3
"""
WSGI entry point for production deployment (backend package)
"""
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app import app, init_db  # type: ignore

# Set production environment variables before importing app
os.environ.setdefault('FLASK_ENV', 'production')
os.environ.setdefault('FLASK_DEBUG', 'False')

# Initialize database in production
init_db()

if __name__ == "__main__":
    app.run()
