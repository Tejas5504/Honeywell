"""
Vercel Serverless Function Entry Point for FastAPI Backend.
Exposes 'app' for Vercel Python serverless runtime.
"""
from app.main import app

# Export FastAPI app instance for Vercel
app = app
