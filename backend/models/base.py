from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Shared declarative base for all SQLAlchemy ORM models.

    All models that inherit from this are picked up by Alembic autogenerate.
    Add new model imports to alembic/env.py alongside the existing Base import.
    """

    pass
