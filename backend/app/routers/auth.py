"""
BurnCare AI - Authentication Router with MongoDB & SQLite Dual-Support
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.mongodb import get_mongo_db, format_doc
from backend.app.models.db_models import User
from backend.app.schemas.schemas import UserRegister, UserLogin, Token, UserResponse
from backend.app.services.auth_service import hash_password, verify_password, create_access_token, get_current_user_optional

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=Token)
def register_user(user_data: UserRegister, db_sql: Session = Depends(get_db)):
    mongo_db = get_mongo_db()
    hashed = hash_password(user_data.password)

    if mongo_db is not None:
        existing = mongo_db.users.find_one({"email": user_data.email})
        if existing:
            raise HTTPException(status_code=400, detail="User email already registered in MongoDB.")

        # Determine next ID
        count = mongo_db.users.count_documents({})
        user_doc = {
            "id": count + 1,
            "email": user_data.email,
            "hashed_password": hashed,
            "full_name": user_data.full_name,
            "role": "user"
        }
        mongo_db.users.insert_one(user_doc)
        token = create_access_token({"sub": str(user_doc["id"]), "email": user_doc["email"], "role": user_doc["role"]})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user_id": user_doc["id"],
            "email": user_doc["email"],
            "full_name": user_doc["full_name"],
            "role": user_doc["role"]
        }

    # SQLite Fallback
    existing_user = db_sql.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User email already registered.")

    new_user = User(
        email=user_data.email,
        hashed_password=hashed,
        full_name=user_data.full_name,
        role="user"
    )
    db_sql.add(new_user)
    db_sql.commit()
    db_sql.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id), "email": new_user.email, "role": new_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "role": new_user.role
    }

@router.post("/login", response_model=Token)
def login_user(credentials: UserLogin, db_sql: Session = Depends(get_db)):
    mongo_db = get_mongo_db()
    if mongo_db is not None:
        user = mongo_db.users.find_one({"email": credentials.email})
        if user and verify_password(credentials.password, user.get("hashed_password", "")):
            uid = user.get("id", 1)
            token = create_access_token({"sub": str(uid), "email": user["email"], "role": user.get("role", "user")})
            return {
                "access_token": token,
                "token_type": "bearer",
                "user_id": uid,
                "email": user["email"],
                "full_name": user.get("full_name"),
                "role": user.get("role", "user")
            }

    # SQLite Fallback
    user_sql = db_sql.query(User).filter(User.email == credentials.email).first()
    if not user_sql or not verify_password(credentials.password, user_sql.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": str(user_sql.id), "email": user_sql.email, "role": user_sql.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user_sql.id,
        "email": user_sql.email,
        "full_name": user_sql.full_name,
        "role": user_sql.role
    }

@router.get("/me", response_model=UserResponse)
def get_me(user_payload=Depends(get_current_user_optional), db_sql: Session = Depends(get_db)):
    if not user_payload:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    uid = int(user_payload["sub"])

    mongo_db = get_mongo_db()
    if mongo_db is not None:
        user = mongo_db.users.find_one({"id": uid})
        if user:
            return format_doc(user)

    user_sql = db_sql.query(User).filter(User.id == uid).first()
    if not user_sql:
        raise HTTPException(status_code=404, detail="User not found.")
    return user_sql
