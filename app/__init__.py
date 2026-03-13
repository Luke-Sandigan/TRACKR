from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from .config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ties db to app
    db.init_app(app)

    from .routes import bp as user_bp
    app.register_blueprint(user_bp)

    return app