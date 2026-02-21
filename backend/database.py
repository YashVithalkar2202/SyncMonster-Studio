import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Railway provides DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")

# If not on Railway, fallback to local MySQL
if not DATABASE_URL:
    DATABASE_URL = "mysql+pymysql://root:password@127.0.0.1:3306/Video_processing"

engine = create_engine(
    DATABASE_URL,
    pool_recycle=3600,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
