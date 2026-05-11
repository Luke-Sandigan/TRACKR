from flask import Blueprint, jsonify, request, render_template, redirect, url_for, flash
from flask_login import current_user, login_user, login_required, logout_user
import sqlalchemy as sa

from app.extensions import db, oauth
from app.models import User, Shelf, Track
from .forms import LoginForm

bp = Blueprint("main", __name__)


def get_user_id():
    return current_user.id if current_user.is_authenticated else None


@bp.route("/")
def landing_page():
    return render_template("landing-page.html")


@bp.route("/tracks")
def tracks_page():
    return render_template("tracks.html")


@bp.route("/signup")
def signup_page():
    return render_template("signup-page.html")


@bp.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("main.profile_page"))

    form = LoginForm()

    if form.validate_on_submit():
        user = db.session.scalar(
            sa.select(User).where(User.username == form.username.data)
        )

        if user and user.check_password(form.password.data):
            login_user(user)
            return redirect(url_for("main.profile_page"))

        flash("Invalid username or password")

    return render_template("login.html", form=form)


@bp.route("/profile")
@login_required
def profile_page():
    latest_shelf = (
        db.session.query(Shelf)
        .filter(Shelf.user_id == current_user.id)
        .order_by(Shelf.created_at.desc())
        .first()
    )

    latest_shelf_tracks = latest_shelf.tracks if latest_shelf else []

    return render_template(
        "profile.html",
        user=current_user,
        latest_shelf=latest_shelf,
        latest_shelf_tracks=latest_shelf_tracks,
    )


@bp.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("main.landing_page"))


@bp.route("/auth/google")
def google_login():
    redirect_uri = url_for("main.google_callback", _external=True)
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
                username=user_info["email"].split("@")[0],
                first_name=user_info.get("given_name", ""),
                last_name=user_info.get("family_name", ""),
            )
            db.session.add(user)

    db.session.commit()
    login_user(user)

    return redirect(url_for("main.profile_page"))


@bp.post("/users")
def create_user():
    data = request.get_json() or {}

    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    first_name = data.get("first_name", "").strip()
    last_name = data.get("last_name", "").strip()
    password = data.get("password", "")

    if not all([username, email, first_name, last_name, password]):
        return jsonify({"error": "All fields are required."}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken."}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered."}), 409

    user = User(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Account created! You can now log in."}), 201


@bp.get("/api/shelves")
def list_shelves():
    user_id = get_user_id()
    if not user_id:
        return jsonify([])

    shelves = Shelf.query.filter_by(user_id=user_id).all()

    return jsonify([
        {"id": s.id, "name": s.name}
        for s in shelves
    ])


@bp.post("/api/shelves")
def create_shelf():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    data = request.get_json() or {}
    name = data.get("name", "").strip()

    if not name:
        return jsonify({"error": "Name required"}), 400

    shelf = Shelf(name=name, user_id=user_id)
    db.session.add(shelf)
    db.session.commit()

    return jsonify({"id": shelf.id, "name": shelf.name})


@bp.delete("/api/shelves/<int:shelf_id>")
def delete_shelf(shelf_id):
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    shelf = Shelf.query.filter_by(id=shelf_id, user_id=user_id).first()
    if not shelf:
        return jsonify({"error": "Shelf not found"}), 404

    db.session.delete(shelf)
    db.session.commit()

    return jsonify({"message": "Deleted"})


@bp.get("/api/shelves/<int:shelf_id>")
def get_shelf(shelf_id):
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    shelf = Shelf.query.filter_by(id=shelf_id, user_id=user_id).first()
    if not shelf:
        return jsonify({"error": "Shelf not found"}), 404

    return jsonify({"id": shelf.id, "name": shelf.name})


@bp.get("/api/shelves/<int:shelf_id>/tracks")
def list_tracks(shelf_id):
    user_id = get_user_id()
    if not user_id:
        return jsonify([])

    shelf = Shelf.query.filter_by(id=shelf_id, user_id=user_id).first()
    if not shelf:
        return jsonify({"error": "Shelf not found"}), 404

    return jsonify([
        {
            "id": t.id,
            "name": t.name,
            "link": t.link,
            "original_price": t.original_price,
            "current_price": t.current_price,
            "notes": t.notes,
        }
        for t in shelf.tracks
    ])


@bp.post("/api/tracks")
def create_track():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    data = request.get_json() or {}

    shelf_id = data.get("shelf_id")
    name = data.get("name")
    link = data.get("link")

    if not shelf_id or not name or not link:
        return jsonify({"error": "Missing fields"}), 400

    shelf = Shelf.query.filter_by(id=shelf_id, user_id=user_id).first()
    if not shelf:
        return jsonify({"error": "Shelf not found"}), 404

    track = Track(
        shelf_id=shelf.id,
        name=name,
        link=link,
        original_price=data.get("original_price"),
        current_price=data.get("current_price"),
        notes=(data.get("notes") or "").strip() or None,
    )
    db.session.add(track)
    db.session.commit()

    return jsonify({"id": track.id})


@bp.patch("/api/tracks/<int:track_id>")
def update_track(track_id):
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    track = (
        db.session.query(Track)
        .join(Shelf, Track.shelf_id == Shelf.id)
        .filter(Track.id == track_id, Shelf.user_id == user_id)
        .first()
    )
    if not track:
        return jsonify({"error": "Track not found"}), 404

    data = request.get_json() or {}
    if "original_price" in data:
        track.original_price = data["original_price"]
    if "current_price" in data:
        track.current_price = data["current_price"]
    if "notes" in data:
        track.notes = (data["notes"] or "").strip() or None

    db.session.commit()
    return jsonify({"message": "Updated"})


@bp.get("/api/stats")
@login_required
def get_stats():
    user_id = current_user.id

    shelves = Shelf.query.filter_by(user_id=user_id).all()
    shelf_count = len(shelves)

    all_tracks = (
        db.session.query(Track)
        .join(Shelf, Track.shelf_id == Shelf.id)
        .filter(Shelf.user_id == user_id)
        .all()
    )
    track_count = len(all_tracks)

    total_savings = sum(
        (t.original_price - t.current_price)
        for t in all_tracks
        if t.original_price is not None
        and t.current_price is not None
        and t.original_price > t.current_price
    )

    chart_data = [
        {
            "name": t.name,
            "original_price": t.original_price,
            "current_price": t.current_price,
        }
        for t in all_tracks
        if t.original_price is not None or t.current_price is not None
    ]

    return jsonify({
        "shelf_count": shelf_count,
        "track_count": track_count,
        "total_savings": round(total_savings, 2),
        "chart_data": chart_data,
    })


@bp.delete("/api/tracks/<int:track_id>")
def delete_track(track_id):
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    track = (
        db.session.query(Track)
        .join(Shelf, Track.shelf_id == Shelf.id)
        .filter(Track.id == track_id, Shelf.user_id == user_id)
        .first()
    )

    if not track:
        return jsonify({"error": "Track not found"}), 404

    db.session.delete(track)
    db.session.commit()

    return jsonify({"message": "Deleted"})


@bp.patch("/api/users/me")
@login_required
def update_profile():
    data = request.get_json() or {}

    if "first_name" in data:
        current_user.first_name = data["first_name"].strip()
    if "last_name" in data:
        current_user.last_name = data["last_name"].strip()
    if "email" in data:
        current_user.email = data["email"].strip()
    if "password" in data and data["password"]:
        current_user.set_password(data["password"])

    db.session.commit()
    return jsonify({"message": "Profile updated"})
