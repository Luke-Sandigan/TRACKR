from app import create_app

app = create_app()

# for Vercel Flask detection
def handler(environ, start_response):
    return app(environ, start_response)