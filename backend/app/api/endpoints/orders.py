from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timedelta
import pytz
from typing import List
from ...schemas.order import OrderCreate, OrderResponse, OrderUpdateStatus, OrderUpdateWeight
from ...core.database import get_database
from ...utils.whatsapp import notify_order_created, notify_order_weighed, notify_status_update, notify_payment_success
from bson import ObjectId

router = APIRouter()

# Harga per layanan
SERVICE_PRICES = {
    "cuci_setrika": 7000,
    "setrika_saja": 3000
}

# Timezone Indonesia (Bali/Denpasar = WITA)
INDONESIA_TZ = pytz.timezone('Asia/Makassar')

def get_indonesia_time():
    """Get current time in Indonesia timezone (WITA)"""
    return datetime.now(INDONESIA_TZ)

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate):
    db = await get_database()
    
    try:
        # Validasi service type
        if order.service_type not in SERVICE_PRICES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipe layanan tidak valid"
            )
    
        # Get current time in Indonesia timezone
        now_indonesia = get_indonesia_time()

        # Convert to UTC database storage
        now_utc = now_indonesia.astimezone(pytz.UTC).replace(tzinfo=None)
        estimasi_utc = (now_indonesia + timedelta(days=2)).astimezone(pytz.UTC).replace(tzinfo=None)
    
        # Generate order number (placeholder, akan di-update setelah insert)
        order_number = f"HL{now_indonesia.strftime('%Y%m%d')}TEMP"

        # Koordinat pickup
        koordinat_data = None
        if order.is_delivery and order.koordinat_pickup:
            if isinstance(order.koordinat_pickup, dict):
                koordinat_data = order.koordinat_pickup
            else:
                koordinat_data = order.koordinat_pickup.model_dump()
    
        # Create order document
        order_dict = {
            "customer_id": order.customer_id,
            "order_number": order_number,
            "service_type": order.service_type,
            "berat": None,
            "harga_per_kg": None,
            "total_harga": None,
            "status_cucian": "pending_weight",
            "payment_status": "pending",
            "is_delivery": order.is_delivery,
            "alamat_pickup": order.alamat_pickup if order.is_delivery else None,
            "koordinat_pickup": koordinat_data,
            "catatan": order.catatan,
            "tanggal_masuk": now_utc,
            "tanggal_ditimbang": None,
            "estimasi_selesai": estimasi_utc
        }
    
        result = await db.orders.insert_one(order_dict)
        inserted_id = result.inserted_id

        # Generate order_number unik dari _id (6 karakter terakhir hex) untuk menghindari duplikat
        short_id = str(inserted_id)[-6:].upper()
        order_number = f"HL{now_indonesia.strftime('%Y%m%d')}{short_id}"
        await db.orders.update_one({"_id": inserted_id}, {"$set": {"order_number": order_number}})
        order_dict["order_number"] = order_number
        order_dict["_id"] = str(inserted_id)
    
    # Get customer info for WhatsApp
        try:
            customer = await db.users.find_one({"_id": ObjectId(order.customer_id)})
            if customer:
                await notify_order_created(
                    customer_name=customer['nama'],
                    phone=customer['no_hp'],
                    order_data={
                        'order_number': order_number,
                        'service_type': order.service_type,
                        'is_delivery': order.is_delivery,
                        'koordinat': koordinat_data,
                        'alamat': order.alamat_pickup if order.is_delivery else None,
                        'estimasi': now_indonesia.strftime('%d %B %Y'),
                        'waktu': now_indonesia.strftime('%d %B %Y, %H:%M')
                    }
                )

        except Exception as e:
            print(f"❌ Error sending notification: {str(e)}")
    
        return order_dict

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating order: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat pesanan: {str(e)}"
        )

@router.put("/{order_id}/weight", response_model=OrderResponse)
async def update_order_weight(order_id: str, weight_update: OrderUpdateWeight):
    db = await get_database()

    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pesanan tidak ditemukan"
        )
    
    if order['status_cucian'] != 'pending_weight':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pesanan sudah ditimbang sebelumnya"
        )
    
    harga_per_kg = SERVICE_PRICES[order['service_type']]
    total_harga = int(weight_update.berat * harga_per_kg)

    now_indonesia = get_indonesia_time()
    now_utc = now_indonesia.astimezone(pytz.UTC).replace(tzinfo=None)

    # Update order dengan berat dan harga
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {
            "$set": {
                "berat": weight_update.berat,
                "harga_per_kg": harga_per_kg,
                "total_harga": total_harga,
                "status_cucian": "received",
                "tanggal_ditimbang": now_utc
            }
        }
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gagal update pesanan"
        )
    
    # Get update order
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    order["_id"] = str(order["_id"])

    # Send WhatsApp notification dengan nota
    try:
        customer = await db.users.find_one({"_id": ObjectId(order["customer_id"])})
        if customer:
            await notify_order_weighed(
                customer_name=customer['nama'],
                phone=customer['no_hp'],
                order_data={
                    'order_number': order['order_number'],
                    'service_type': order['service_type'],
                    'berat': weight_update.berat,
                    'harga_per_kg': harga_per_kg,
                    'total_harga': total_harga,
                    'estimasi': now_indonesia.strftime('%d %B %Y')
                }
            )
    except Exception as e:
        print(f"❌ Error sending nota notification: {str(e)}")
    
    return order

@router.get("/", response_model=List[OrderResponse])
async def get_all_orders():
    db = await get_database()
    orders = await db.orders.find().sort("tanggal_masuk", -1).to_list(100)
    
    for order in orders:
        order["_id"] = str(order["_id"])
    
    return orders

@router.get("/customer/{customer_id}", response_model=List[OrderResponse])
async def get_customer_orders(customer_id: str):
    db = await get_database()
    orders = await db.orders.find({"customer_id": customer_id}).sort("tanggal_masuk", -1).to_list(100)
    
    for order in orders:
        order["_id"] = str(order["_id"])
    
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str):
    db = await get_database()
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pesanan tidak ditemukan"
        )
    
    order["_id"] = str(order["_id"])
    return order

@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(order_id: str, status_update: OrderUpdateStatus):
    db = await get_database()
    
    # Validasi status
    valid_statuses = ["pending_weight", "received", "washing", "drying", "ironing", "ready"]
    if status_update.status_cucian not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status tidak valid"
        )
    
    # Update status
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status_cucian": status_update.status_cucian}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pesanan tidak ditemukan"
        )
    
    # Get updated order
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    order["_id"] = str(order["_id"])

    # Send status notification (hanya untuk status penting)
    NOTIFY_STATUSES = ['ready']
    if status_update.status_cucian in NOTIFY_STATUSES:
        try:
            customer = await db.users.find_one({"_id": ObjectId(order["customer_id"])})
            if customer:
                now_indonesia = get_indonesia_time()
                await notify_status_update(
                    customer_name=customer['nama'],
                    phone=customer['no_hp'],
                    order_data={
                        'order_number': order['order_number'],
                        'status': status_update.status_cucian,
                        'waktu': now_indonesia.strftime('%d %B %Y, %H:%M')
                    }
                )
        except Exception as e:
            print(f"❌ Error sending status notification: {str(e)}")

    return order

@router.delete("/{order_id}")
async def delete_order(order_id: str):
    db = await get_database()
    
    result = await db.orders.delete_one({"_id": ObjectId(order_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pesanan tidak ditemukan"
        )
    
    return {"message": "Pesanan berhasil dihapus"}

@router.put("/{order_id}/payment-status")
async def update_payment_status(order_id: str, payment_data: dict):
    """"Update payment status manually"""
    db = await get_database()

    payment_status = payment_data.get('payment_status', 'pending')

    # Validasi payment status
    if payment_status not in ['pending', 'paid', 'failed']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status pembayaran tidak valid"
        )
    
    # Update order
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"payment_status": payment_status}}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pesanan tidak ditemukan"
        )
    
    # Update payment record
    await db.payments.update_one(
        {"order_id": order_id},
        {"$set": {"status": payment_status}}
    )

    # Send WhatsApp notification if paid
    if payment_status == 'paid':
        try:
            order = await db.orders.find_one({"_id": ObjectId(order_id)})
            customer = await db.users.find_one({"_id": ObjectId(order['customer_id'])})
            
            if customer and order.get('total_harga'):
                now_indonesia = get_indonesia_time()

                status_text_map = {
                    "pending_weight": "Menunggu Ditimbang",
                    "received": "Diterima",
                    "washing": "Sedang Dicuci",
                    "drying": "Sedang Dikeringkan",
                    "ironing": "Sedang Disetrika",
                    "ready": "Sudah Selesai"
                }

                await notify_payment_success(
                    customer_name=customer['nama'],
                    phone=customer['no_hp'],
                    payment_data={
                        'order_number': order['order_number'],
                        'amount': order['total_harga'],
                        'method': 'Midtrans',
                        'waktu': now_indonesia.strftime('%d %B %Y, %H:%M'),
                        'order_status': status_text_map.get(order['status_cucian'], 'Diproses')
                    }
                )

        except Exception as e:
            print(f"❌ Error sending payment notification: {str(e)}")

    return {"message": "Status pembayaran berhasil diupdate"}