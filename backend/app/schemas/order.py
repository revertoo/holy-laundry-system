from pydantic import BaseModel, Field
from typing import Optional, Union
from datetime import datetime

class KoordinatPickup(BaseModel):
    latitude: float
    longitude: float

class OrderCreate(BaseModel):
    customer_id: str
    service_type: str 
    is_delivery: bool = True
    alamat_pickup: Optional[str] = None
    koordinat_pickup: Optional[Union[dict, KoordinatPickup]] = None
    catatan: Optional[str] = None

class OrderUpdateWeight(BaseModel):
    berat: float

class OrderResponse(BaseModel):
    id: str = Field(alias="_id")
    customer_id: str
    order_number: str
    service_type: str
    berat: Optional[float] = None
    harga_per_kg: Optional[int] = None
    total_harga: Optional[int] = None
    status_cucian: str 
    payment_status: str 
    is_delivery: bool 
    alamat_pickup: Optional[str] = None
    koordinat_pickup: Optional[dict] = None
    catatan: Optional[str] = None
    tanggal_masuk: datetime
    tanggal_ditimbang: Optional[datetime] = None
    estimasi_selesai: datetime

    class Config:
        populate_by_name = True
    
class OrderUpdateStatus(BaseModel):
    status_cucian: str