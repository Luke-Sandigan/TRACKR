from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
import os

from .extensions import db, login, oauth
from .config import Config


def create_app():
    app = Flask(__name__)

    # config
    app.config.from_object(Config)
    app.config["SECRET_KEY"] = "trackr_db12345"

    # init extensions
    db.init_app(app)
    login.init_app(app)
    oauth.init_app(app)

    Migrate(app, db)
    CORS(app)

    # register blueprint
    from .routes import bp
    app.register_blueprint(bp)

    # register google oauth (safe here)
    oauth.register(
        name="google",
        client_id=app.config["GOOGLE_CLIENT_ID"],
        client_secret=app.config["GOOGLE_CLIENT_SECRET"],
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )

    # register models
    from . import models

    # Ensure tables exist for out-of-the-box dev (SQLite default).
    # On serverless (e.g. Vercel) with Supabase Postgres, use migrations instead.
    db_uri = (app.config.get("SQLALCHEMY_DATABASE_URI") or "").lower()
    auto_create = os.environ.get("AUTO_CREATE_DB", "").lower() in ("1", "true", "yes")
    if db_uri.startswith("sqlite") or auto_create:
        with app.app_context():
            db.create_all()

    return app