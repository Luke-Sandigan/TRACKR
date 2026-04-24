from typing import Optional
import sqlalchemy as sa
import sqlalchemy.orm as so

from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

from app.extensions import db, login

@login.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

class User(UserMixin, db.Model):
    __tablename__ = "users"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)

    username: so.Mapped[str] = so.mapped_column(
        sa.String(36), unique=True, index=True
    )

    first_name: so.Mapped[str] = so.mapped_column(
        sa.String(64), nullable=False
    )

    last_name: so.Mapped[str] = so.mapped_column(
        sa.String(64), nullable=False
    )

    email: so.Mapped[str] = so.mapped_column(
        sa.String(64), unique=True, index=True
    )

    password_hash: so.Mapped[Optional[str]] = so.mapped_column(
        sa.String(256)
    )

    google_id: so.Mapped[Optional[str]] = so.mapped_column(
        sa.String(128), unique=True, nullable=True
    )

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash or "", password)

    def __repr__(self):
        return f"<User {self.username}>"