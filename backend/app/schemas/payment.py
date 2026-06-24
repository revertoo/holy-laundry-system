from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PaymentCreate(BaseModel):
    order_id: str
    metode: str # midtrans, cash

class PaymentResponse(BaseModele):
    id: str = Field(alias="_id")
    order_id: str
    snap_token: Optional[str] = None
    midtrans_transaction_id: Optional[str] = None
    jumlah: int
    metode: str
    status: str # pending, paid, failed
    tanggal: datetime

    class Config:
        populate_by_name = True