from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
from app.database import users_collection
from app.models.user import (
    UserRegister, UserLogin, GoogleSignIn,
    UserUpdate, UserResponse, TokenResponse,
)
from app.utils.auth import (
    hash_password, verify_password,
    create_access_token, get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def user_to_response(user: dict) -> UserResponse:
    return UserResponse(
        id=str(user["_id"]),
        username=user["username"],
        name=user.get("name", user["username"]),
        email=user.get("email"),
        phone=user.get("phone"),
        avatar=user.get("avatar", ""),
        provider=user.get("provider", "email"),
        created_at=user.get("created_at", datetime.now(timezone.utc)),
    )


# ── Register ──
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister):
    existing = await users_collection.find_one({"username": data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")

    if data.email:
        existing_email = await users_collection.find_one({"email": data.email})
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")

    if data.phone:
        existing_phone = await users_collection.find_one({"phone": data.phone})
        if existing_phone:
            raise HTTPException(status_code=400, detail="Phone number already registered")

    # ── Only include email/phone if actually provided ──
    user_doc = {
        "username": data.username,
        "name": data.username,
        "password": hash_password(data.password),
        "avatar": "",
        "provider": data.provider,
        "created_at": datetime.now(timezone.utc),
    }
    if data.email:
        user_doc["email"] = data.email
    if data.phone:
        user_doc["phone"] = data.phone

    result = await users_collection.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token(str(result.inserted_id))
    return TokenResponse(access_token=token, user=user_to_response(user_doc))


# ── Login ──
@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await users_collection.find_one({
        "$or": [
            {"email": data.identifier},
            {"phone": data.identifier},
            {"username": data.identifier},
        ]
    })

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(str(user["_id"]))
    return TokenResponse(access_token=token, user=user_to_response(user))


# ── Google Sign-in ──
@router.post("/google", response_model=TokenResponse)
async def google_signin(data: GoogleSignIn):
    user = await users_collection.find_one({"email": data.email})

    if user:
        updates = {}
        if data.name and data.name != user.get("name"):
            updates["name"] = data.name
        if data.avatar and data.avatar != user.get("avatar"):
            updates["avatar"] = data.avatar
        if updates:
            await users_collection.update_one({"_id": user["_id"]}, {"$set": updates})
            user.update(updates)
    else:
        username = data.email.split("@")[0]
        base_username = username
        counter = 1
        while await users_collection.find_one({"username": username}):
            username = f"{base_username}{counter}"
            counter += 1

        user = {
            "username": username,
            "name": data.name,
            "email": data.email,
            "password": hash_password(data.email + "google-oauth"),
            "avatar": data.avatar or "",
            "provider": "google",
            "created_at": datetime.now(timezone.utc),
        }
        result = await users_collection.insert_one(user)
        user["_id"] = result.inserted_id

    token = create_access_token(str(user["_id"]))
    return TokenResponse(access_token=token, user=user_to_response(user))


# ── Get current user ──
@router.get("/me", response_model=UserResponse)
async def get_me(user=Depends(get_current_user)):
    return user_to_response(user)


# ── Update profile ──
@router.put("/me", response_model=UserResponse)
async def update_profile(data: UserUpdate, user=Depends(get_current_user)):
    updates = {}

    if data.name is not None:
        updates["name"] = data.name
    if data.email is not None:
        existing = await users_collection.find_one({"email": data.email, "_id": {"$ne": user["_id"]}})
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        updates["email"] = data.email
    if data.phone is not None:
        existing = await users_collection.find_one({"phone": data.phone, "_id": {"$ne": user["_id"]}})
        if existing:
            raise HTTPException(status_code=400, detail="Phone already in use")
        updates["phone"] = data.phone
    if data.avatar is not None:
        updates["avatar"] = data.avatar

    if updates:
        await users_collection.update_one({"_id": user["_id"]}, {"$set": updates})
        user.update(updates)

    return user_to_response(user)