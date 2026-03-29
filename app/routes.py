from flask import jsonify, request
from werkzeug.security import generate_password_hash
from app.models import User
from . import app, db
from flask import render_template, redirect, url_for, flash
from flask_login import current_user, login_user, login_required, logout_user
from .forms import LoginForm
import sqlalchemy as sa

@app.route("/")
def home():
    return render_template("landing-page.html")

@app.route("/signup")
def signup_page():
    return render_template("signup-page.html")

@app.route("/landing")
def landing_page():
    return render_template("landing-page.html")

@app.route("/debug-user")
def debug_user():
    if current_user.is_authenticated:
        return f"Logged in as {current_user.username}"
    return "Not logged in"

@app.route("/profile")
@login_required
def profile_page():
    return render_template("profile.html")

@app.route('/users', methods=['POST'])
def register_user():
    try:
        data = request.get_json() or request.form
        username = data.get("username", "").strip()
        email = data.get("email", "").strip()
        first_name = data.get("first_name", "").strip()
        last_name = data.get("last_name", "").strip()
        password = data.get("password", "")
        
        # validate rquired fields
        if not username or not email or not password:
            return jsonify({"error": "All fields are required"}), 400

        #check if user/email already exits#
        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already exists"}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already exists"}), 400

        hashed_password = generate_password_hash(password)
        new_user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password_hash=hashed_password
        )
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({"message": "User Registered Successfully"}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('landing_page'))

    form = LoginForm()

    if form.validate_on_submit():
        user = db.session.scalar(
            sa.select(User).where(User.username == form.username.data)
        )

        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password')
            return redirect(url_for('login'))

        login_user(user, remember=form.remember_me.data)
        return redirect(url_for('profile_page'))

    return render_template('login.html', title='Sign In', form=form)

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('landing_page'))
    
@app.route('/delete-account', methods=['POST'])
@login_required
def delete_account():
    try:
        user = current_user

        db.session.delete(user)
        db.session.commit()

        logout_user()  # important: clear session

        return jsonify({"message": "Account deleted"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/users/<int:user_id>', methods=['GET'])
def search_user(user_id):
    try:
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "id": user.user_id,
            "username": user.username,
            "email": user.email
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/user/<int:user_id>")
def get_user(user_id):
    user = User.query.get(user_id)

    return jsonify({
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email
    })     

