from fastapi import APIRouter, HTTPException, status
from typing import List
from ...schemas.user import UserResponse
from ...core.database import get_database
from ...core.config import settings
from ...utils.geolocation import is_within_radius
from bson import ObjectId
from pydantic import BaseModel

router = APIRouter()

class LocationValidation(BaseModel):
    latitude: float
    longitude: float

@router.get("/", response_model=List[UserResponse])
async def get_all_customers():
    db = await get_database()
    customers = await db.users.find({"role": "customer"}).to_list(100)

    for customer in customers:
        customer["_id"] = str(customer["_id"])

    return customers

@router.get("/{customer_id}", response_model=UserResponse)
async def get_customer(customer_id: str):
    db = await get_database()
    customer = await db.users.find_one({"_id": ObjectId(customer_id)})

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pelanggan tidak ditemukan"
        )
    
    customer["_id"] = str(customer["_id"])
    return customer

@router.post("/validate-location")
async def validate_location(location: LocationValidation):
    """Validasi apakah lokasi customer dalam radius 2 km dari toko"""
    result = is_within_radius(
        customer_lat=location.latitude,
        customer_lon=location.longitude,
        store_lat=settings.STORE_LATITUDE,
        store_lon=settings.STORE_LONGITUDE,
        max_radius_km=settings.MAX_DELIVERY_RADIUS_KM
    )

    if not result["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )
    
    return result