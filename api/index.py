from app import create_app

# Vercel Python Serverless Function entrypoint.
# Exposes the Flask app (pages + /api/*).
app = create_app()

