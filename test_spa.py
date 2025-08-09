#!/usr/bin/env python3
from backend.app import app
import json

with app.test_client() as client:
    # Test root route
    resp = client.get('/')
    print('Root route status:', resp.status_code)
    print('Content type:', resp.content_type)
    if resp.status_code != 200:
        print('Error response:', resp.data.decode()[:500])
    
    # Test health
    health_resp = client.get('/health')
    print('Health status:', health_resp.status_code)
