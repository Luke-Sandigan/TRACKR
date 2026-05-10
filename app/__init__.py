from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS

from .extensions import db, login, oauth
from .config import Config


def create_app():
    app = Flask(__name__)

    # Load config
    app.config.from_object(Config)

    # Safety check (helps debugging Vercel crashes)
    if not app.config.get("SQLALCHEMY_DATABASE_URI"):
        raise Exception("DATABASE_URL is missing or invalid")

    # Init extensions
    db.init_app(app)
    login.init_app(app)
    oauth.init_app(app)

    Migrate(app, db)
    CORS(app)

    # Register blueprints
    from .routes import bp
    app.register_blueprint(bp)

    # OAuth setup
    oauth.register(
        name="google",
        client_id=app.config.get("GOOGLE_CLIENT_ID"),
        client_secret=app.config.get("GOOGLE_CLIENT_SECRET"),
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )

    return app