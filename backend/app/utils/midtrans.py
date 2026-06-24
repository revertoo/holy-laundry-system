import midtransclient
from ..core.config import settings

def create_snap_token(order_id: str, gross_amount: int, customer_details: dict):
    """
    Create Midtrans Snap token for payment
    
    Args:
        order_id: Order number (e.g., HL20260324001)
        gross_amount: Total amount in IDR
        customer_details: Dict with customer info (name, email, phone)
    
    Returns:
        Snap token string
    """
    # Initialize Snap client
    snap = midtransclient.Snap(
        is_production=settings.MIDTRANS_IS_PRODUCTION,
        server_key=settings.MIDTRANS_SERVER_KEY,
        client_key=settings.MIDTRANS_CLIENT_KEY
    )
    
    # Prepare transaction details
    transaction_details = {
        'order_id': order_id,
        'gross_amount': gross_amount
    }
    
    # Prepare item details
    item_details = [{
        'id': order_id,
        'price': gross_amount,
        'quantity': 1,
        'name': f'Holy Laundry - {order_id}'
    }]
    
    # Prepare customer details
    customer = {
        'first_name': customer_details.get('name', 'Customer'),
        'email': customer_details.get('email', 'customer@email.com'),
        'phone': customer_details.get('phone', '08123456789')
    }
    
    # Prepare transaction data
    transaction_data = {
        'transaction_details': transaction_details,
        'item_details': item_details,
        'customer_details': customer
    }
    
    try:
        # Create Snap transaction
        snap_response = snap.create_transaction(transaction_data)
        return snap_response['token']
    except Exception as e:
        print(f"Error creating Snap token: {str(e)}")
        raise Exception(f"Failed to create payment token: {str(e)}")