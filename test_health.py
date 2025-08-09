#!/usr/bin/env python3
from backend.app import app
import json

with app.test_client() as client:
    resp = client.get('/health')
    print('Health check response:', resp.status_code)
    print('Health data:', json.loads(resp.data.decode()))
