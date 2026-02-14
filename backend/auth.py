from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# --- Configuration ---
# In a real production app, these would be in an .env file
SECRET_KEY = "senior_dev_secret_key_change_this" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# --- Setup ---
# Using bcrypt for secure password storage
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Hardcoded User Database ---
# We store the hashed version of 'password123' for the user 'admin'
FAKE_USER_DB = {
    "admin": pwd_context.hash("password123")
}

# --- Core Logic ---

def hash_password(password: str):
    """Generates a secure hash from a plain-text password."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    """Compares a plain-text password against a stored hash."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    """Generates a JWT token that expires in 60 minutes."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Dependency to protect routes. 
    It decodes the JWT and verifies if the user exists.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except JWTError:
        raise credentials_exception