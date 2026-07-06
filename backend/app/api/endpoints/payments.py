from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from ...core.database import get_database
from ...utils.midtrans import create_snap_token
from bson import ObjectId
import pytz

router = APIRouter()

INDONESIA_TZ = pytz.timezone('Asia/Makassar')

@router.post("/create-token/{order_id}")
async def create_payment_token(order_id: str):
    """Create Midtrans Snap token for payment"""
    db = await get_database()
    
    # Get order
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pesanan tidak ditemukan"
        )
    
    # Check if already paid
    if order.get('payment_status') == 'paid':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pesanan sudah dibayar"
        )
    
    # Get customer
    customer = await db.users.find_one({"_id": ObjectId(order['customer_id'])})
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer tidak ditemukan"
        )
    
    try:
        # Check if pending payment token already exists
        existing_payment = await db.payments.find_one({
            "order_id": str(order['_id']),
            "status": "pending"
        })
        
        if existing_payment and existing_payment.get('snap_token'):
            return {
                "snap_token": existing_payment['snap_token'],
                "order_number": order['order_number'],
                "amount": order['total_harga']
            }

        # Create Snap token
        snap_token = create_snap_token(
            order_id=order['order_number'],
            gross_amount=order['total_harga'],
            customer_details={
                'name': customer['nama'],
                'email': customer['email'],
                'phone': customer['no_hp']
            }
        )
        
        # Save payment record
        now_indonesia = datetime.now(INDONESIA_TZ)
        now_utc = now_indonesia.astimezone(pytz.UTC).replace(tzinfo=None)
        
        payment_data = {
            "order_id": str(order['_id']),
            "order_number": order['order_number'],
            "snap_token": snap_token,
            "jumlah": order['total_harga'],
            "metode": "midtrans",
            "status": "pending",
            "tanggal": now_utc
        }
        
        await db.payments.insert_one(payment_data)
        
        return {
            "snap_token": snap_token,
            "order_number": order['order_number'],
            "amount": order['total_harga']
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/notification")
async def payment_notification(notification: dict):
    """Webhook handler for Midtrans payment notification"""
    db = await get_database()
    
    order_id = notification.get('order_id')
    transaction_status = notification.get('transaction_status')
    fraud_status = notification.get('fraud_status', 'accept')
    
    # Find order by order_number
    order = await db.orders.find_one({"order_number": order_id})
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pesanan tidak ditemukan"
        )
    
    # Determine payment status
    payment_status = 'pending'
    
    if transaction_status == 'capture':
        if fraud_status == 'accept':
            payment_status = 'paid'
    elif transaction_status == 'settlement':
        payment_status = 'paid'
    elif transaction_status in ['cancel', 'deny', 'expire']:
        payment_status = 'failed'
    elif transaction_status == 'pending':
        payment_status = 'pending'
    
    # Update order payment status
    await db.orders.update_one(
        {"_id": order['_id']},
        {"$set": {"payment_status": payment_status}}
    )
    
    # Update payment record
    await db.payments.update_one(
        {"order_number": order_id},
        {
            "$set": {
                "status": payment_status,
                "midtrans_transaction_id": notification.get('transaction_id'),
                "payment_type": notification.get('payment_type'),
                "transaction_time": notification.get('transaction_time')
            }
        }
    )
    
    return {"status": "success", "message": "Payment status updated"}

@router.get("/history/{customer_id}")
async def get_payment_history(customer_id: str):
    """Get payment history for a customer"""
    db = await get_database()
    
    # Get all orders for customer
    orders = await db.orders.find({"customer_id": customer_id}).to_list(100)
    order_ids = [str(order['_id']) for order in orders]
    
    # Get payments
    payments = await db.payments.find({"order_id": {"$in": order_ids}}).to_list(100)
    
    for payment in payments:
        payment['_id'] = str(payment['_id'])
    
    return payments