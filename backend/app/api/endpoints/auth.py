from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from ...schemas.user import UserCreate, UserLogin, UserResponse
from ...core.security import get_password_hash, verify_password,  create_access_token
from ...core.database import get_database
from bson import ObjectId

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    db = await get_database()

    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar"
        )
    
    # Validasi nomor HP
    if not user.no_hp or len(user.no_hp) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nomor HP tidak valid"
        )

    # Format phone number
    phone = user.no_hp.replace(' ', '').replace('-', '').replace('+', '')

    # Convert 08xxx to 628xxx
    if phone.startswith('0'):
        phone = '62' + phone[1:]
    elif not phone.startswith('62'):
        phone = '62' + phone

    print(f"📱 Registering user with phone: {phone}")

    # Hash password
    hashed_password = get_password_hash(user.password)

    # Create user document
    user_dict = {
        "email": user.email,
        "nama": user.nama,
        "no_hp": user.no_hp,
        "role": user.role,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow(),
        "alamat": None,
        "koordinat": None
    }

    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)

    return user_dict

@router.post("/login")
async def login(credentials: UserLogin):
    db = await get_database()

    # Find user
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah"
        )
    
    # Created accses token
    access_token = create_access_token(data={
        "sub": user["email"],
        "user_id": str(user["_id"]),
        "role": user["role"],
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "_id": str(user["_id"]),
            "email": user["email"],
            "nama": user["nama"],
            "role": user["role"]
        }
    }