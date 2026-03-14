from typing import Optional
import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db

class User(db.Model):
    __tablename__="users"

    user_id: so.Mapped[int] = so.mapped_column(primary_key=True)

    username: so.Mapped[str] = so.mapped_column(
        sa.String(36), index=True, unique=True
    )
    first_name: so.Mapped[str] = so.mapped_column(
        sa.String(64), nullable=False
    )
    last_name: so.Mapped[str] = so.mapped_column(
        sa.String(64), nullable=False
    )
    email: so.Mapped[str] = so.mapped_column(
        sa.String(64), index=True, unique=True
    )
    password_hash: so.Mapped[Optional[str]] = so.mapped_column(
        sa.String(256)
    )

    def __repr__(self):
        return '<User {}>'.format(self.username)