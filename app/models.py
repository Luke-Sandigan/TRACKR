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
    contact_number: so.Mapped[str] = so.mapped_column(
        sa.String(15), index=True, unique=True
    )
    password_hash: so.Mapped[Optional[str]] = so.mapped_column(
        sa.String(256)
    )

    def __repr__(self):
        return '<User {}>'.format(self.username)

# class Model(db.Model):
#     track_id: so.Mapped[str] = so.mapped_column(
#         sa.String(64), primary_key=True
#     )

#     user_id: so.Mapped[str] = so.mapped_column(
#         sa.String(24), 
#     )
    
#     product_id: so.Mapped[str] = sp.mapped_column(
#         sa.String(64)
#     )

#     promotion: 

#     product_img: 