from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS

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

    print(app.config["SQLALCHEMY_DATABASE_URI"])

    return app