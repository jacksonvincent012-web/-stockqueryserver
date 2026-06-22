"""Vercel serverless entry point for Stock Query Server API."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Disable simulator for serverless (no persistent threads)
os.environ['VERCEL_SERVERLESS'] = '1'

from api.server import app

# Vercel serverless handler
handler = app
