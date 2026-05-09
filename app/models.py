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

    shelves: so.Mapped[list["Shelf"]] = so.relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash or "", password)

    def __repr__(self):
        return f"<User {self.username}>"


class Shelf(db.Model):
    __tablename__ = "shelves"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(64), index=True)

    # Optional ownership; if unauthenticated, shelves can be "global" (user_id NULL).
    user_id: so.Mapped[Optional[int]] = so.mapped_column(
        sa.ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    user: so.Mapped[Optional[User]] = so.relationship(back_populates="shelves")
    tracks: so.Mapped[list["Track"]] = so.relationship(
        back_populates="shelf",
        cascade="all, delete-orphan",
        order_by="Track.created_at.desc()",
    )

    created_at: so.Mapped[sa.DateTime] = so.mapped_column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
    )


class Track(db.Model):
    __tablename__ = "tracks"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    shelf_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("shelves.id"),
        index=True,
    )

    name: so.Mapped[str] = so.mapped_column(sa.String(128))
    link: so.Mapped[str] = so.mapped_column(sa.String(2048))

    created_at: so.Mapped[sa.DateTime] = so.mapped_column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        index=True,
    )

    shelf: so.Mapped[Shelf] = so.relationship(back_populates="tracks")