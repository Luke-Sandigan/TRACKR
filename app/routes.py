from flask import Blueprint, jsonify, request, render_template, redirect, url_for, flash
from flask_login import current_user, login_user, login_required, logout_user
from werkzeug.security import generate_password_hash
import sqlalchemy as sa

from app.extensions import db, oauth
from app.models import User
from .forms import LoginForm

bp = Blueprint("main", __name__)

@bp.route("/")
def home():
    return render_template("landing-page.html")


@bp.route("/signup")
def signup_page():
    return render_template("signup-page.html")


@bp.route("/landing")
def landing_page():
    return render_template("landing-page.html")


@bp.route("/profile")
@login_required
def profile_page():
    return render_template("profile.html")


@bp.route("/debug-user")
def debug_user():
    if current_user.is_authenticated:
        return f"Logged in as {current_user.username}"
    return "Not logged in"

@bp.route("/auth/google")
def google_login():
    redirect_uri = "http://localhost:5000/auth/google/callback"
    return oauth.google.authorize_redirect(redirect_uri)


@bp.route("/auth/google/callback")
def google_callback():
    token = oauth.google.authorize_access_token()
    user_info = token.get("userinfo")

    user = User.query.filter_by(google_id=user_info["sub"]).first()

    if not user:
        user = User.query.filter_by(email=user_info["email"]).first()

        if user:
            user.google_id = user_info["sub"]
        else:
            user = User(
                google_id=user_info["sub"],
                email=user_info["email"],
                first_name=user_info.get("given_name", ""),
                last_name=user_info.get("family_name", ""),
                username=user_info["email"].split("@")[0]
            )
            db.session.add(user)

    db.session.commit()
    login_user(user)

    return redirect(url_for("main.profile_page"))

@bp.route("/users", methods=["POST"])
def register_user():
    try:
        data = request.get_json() or request.form

        username = data.get("username", "").strip()
        email = data.get("email", "").strip()
        first_name = data.get("first_name", "").strip()
        last_name = data.get("last_name", "").strip()
        password = data.get("password", "")

        if not username or not email or not password:
            return jsonify({"error": "All fields are required"}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already exists"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already exists"}), 400

        new_user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password_hash=generate_password_hash(password)
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@bp.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()

    if form.validate_on_submit():
        user = db.session.scalar(
            sa.select(User).where(User.username == form.username.data)
        )

        if user is None or not user.check_password(form.password.data):
            flash("Invalid username or password")
            return redirect(url_for("main.login"))

        login_user(user, remember=form.remember_me.data)
        return redirect(url_for("main.profile_page"))

    return render_template("login.html", form=form)


@bp.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("main.landing_page"))


# -------------------
# USER MANAGEMENT
# -------------------

@bp.route("/delete-account", methods=["POST"])
@login_required
def delete_account():
    try:
        db.session.delete(current_user)
        db.session.commit()
        logout_user()

        return jsonify({"message": "Account deleted"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@bp.route("/users/<int:user_id>", methods=["GET"])
def search_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.user_id,
        "username": user.username,
        "email": user.email
    }), 200


@bp.route("/user/<int:user_id>")
def get_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email
    })