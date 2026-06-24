from pydantic import BaseModel, Field
from typing import Optional

class ServiceBase(BaseModel):
    nama_layanan: str
    harga_per_kg: int
    deskripsi: Optional[str] = None
    estimasi_hari: int = 2

class ServiceCreate(ServiceBase):
    pass

class ServiceResponse(ServiceBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True