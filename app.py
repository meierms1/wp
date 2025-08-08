#!/usr/bin/env python3
"""
Delegator module: use backend.app as the single Flask app.
This avoids duplication and ensures consistent configuration.
"""
from backend.app import app, init_db  # type: ignore
import os

if __name__ == "__main__":
    init_db()
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    app.run(debug=debug_mode, port=port, host=host)
