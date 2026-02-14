from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Format: mysql+pymysql://user:password@host:port/database
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:password@127.0.0.1:3306/Video_processing"

engine = create_engine(
    # pool_recycle helps prevent "MySQL server has gone away" errors
    SQLALCHEMY_DATABASE_URL, pool_recycle=3600 
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session in our routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()