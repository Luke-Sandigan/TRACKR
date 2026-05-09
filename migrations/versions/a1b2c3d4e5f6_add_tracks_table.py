"""add tracks table

Revision ID: a1b2c3d4e5f6
Revises: 46d9e50528eb
Create Date: 2026-05-09 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '46d9e50528eb'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'tracks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('url', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('tracks', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_tracks_user_id'), ['user_id'], unique=False)


def downgrade():
    with op.batch_alter_table('tracks', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_tracks_user_id'))
    op.drop_table('tracks')
