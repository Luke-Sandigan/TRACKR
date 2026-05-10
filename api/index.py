import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy()

db.init_app(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100))

@app.route("/")
def home():
    return "TRACKR connected to Supabase!"