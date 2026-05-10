from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
import os

from .extensions import db, login, oauth
from .config import Config


def create_app():
    app = Flask(__name__)

    # Load config
    app.config.from_object(Config)

    # Ensure DATABASE_URL works on Vercel
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise RuntimeError("DATABASE_URL environment variable is not set.")
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Init extensions
    db.init_app(app)
    login.init_app(app)
    login.login_view = "main.login"  # redirect to login when @login_required fails
    CORS(app)

    # Init OAuth before registering blueprint
    oauth.init_app(app)

    oauth.register(
        name="google",
        client_id=app.config.get("GOOGLE_CLIENT_ID"),
        client_secret=app.config.get("GOOGLE_CLIENT_SECRET"),
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )

    # Register blueprints
    from .routes import bp
    app.register_blueprint(bp)

    # Migrations
    Migrate(app, db)

    return app
