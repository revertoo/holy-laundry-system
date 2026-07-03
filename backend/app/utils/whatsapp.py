import json
import os
import httpx
from datetime import datetime
from ..core.config import settings

LOG_FILE = "whatsapp_logs.json"

def _load_logs() -> list:
    try:
        if not os.path.exists(LOG_FILE):
            return []
        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Error loading logs: {e}")
        return []

def _save_logs(logs: list):
    try:
        with open(LOG_FILE, 'w', encoding='utf-8') as f:
            json.dump(logs, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"❌ Error saving logs: {e}")

def _save_to_log(phone_number: str, message: str, message_type: str = "general", status: str = "pending_manual_send"):
    """Simpan pesan ke file log untuk review manual"""
    try:
        logs = _load_logs()

        log_entry = {
            "id": len(logs),
            "timestamp": datetime.now().isoformat(),
            "phone": phone_number,
            "message": message,
            "message_type": message_type,
            "status": status,
            "sent_at": datetime.now().isoformat() if status == "sent_auto" else None
        }

        logs.append(log_entry)
        _save_logs(logs)

        print(f"\n{'='*60}")
        print(f"📝 [WhatsApp Log] Status: {status}")
        print(f"📱 To: {phone_number}")
        print(f"📋 Type: {message_type}")
        print(f"💬 Preview: {message[:80]}...")
        print(f"{'='*60}\n")
    
    except Exception as e:
        print(f"❌ Error saving log: {str(e)}")

async def send_whatsapp_notification(
    phone_number: str,
    message: str,
    message_type: str = "general"
):
    """
    Send WhatsApp notification using Wablas API or Mock to logs.
    """
    if not phone_number or phone_number.strip() == "":
        print("❌ WhatsApp: Empty phone number, skipping")
        return False

    # Format phone number
    phone = phone_number.replace('+', '').replace(' ','').replace('-','')
    if phone.startswith('0'):
        phone = '62' + phone[1:]
    if not phone.startswith('62'):
        phone = '62' + phone
    
    if not settings.WA_ENABLED:
        # MOCK MODE
        _save_to_log(phone, message, message_type, status="pending_manual_send")
        return True

    # WABLAS MODE
    domain = settings.WABLAS_DOMAIN
    token = settings.WABLAS_API_TOKEN
    secret = getattr(settings, 'WABLAS_SECRET_KEY', None)
    
    if not domain or not token:
        print("❌ WhatsApp: Wablas credentials missing, falling back to mock")
        _save_to_log(phone, message, message_type, status="error_missing_creds")
        return False

    url = f"https://{domain}/api/send-message"
    # Wablas uses token.secret in Authorization header for some v2 servers
    auth_header = f"{token}.{secret}" if secret else token
    
    headers = {
        "Authorization": auth_header,
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    payload = {
        "phone": phone,
        "message": message,
        "isGroup": "false"
    }
    
    if secret:
        payload["secret"] = secret

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            
            if response.status_code == 200:
                print("✅ WhatsApp: Successfully sent via Wablas")
                _save_to_log(phone, message, message_type, status="sent_auto")
                return True
            else:
                print(f"❌ WhatsApp: Wablas API Error: {response.status_code} - {response.text}")
                _save_to_log(phone, message, message_type, status="error_wablas_api")
                return False
    except Exception as e:
        print(f"❌ WhatsApp: Failed to connect to Wablas: {e}")
        _save_to_log(phone, message, message_type, status="error_connection")
        return False

# =============================================
# MESSAGE TEMPLATES
# =============================================

async def notify_order_created(
    customer_name: str,
    phone: str,
    order_data: dict
):
    """Notifikasi order baru dibuat"""

    if order_data.get('is_delivery') and order_data.get('koordinat'):
        lat = order_data['koordinat'].get('latitude')
        lng = order_data['koordinat'].get('longitude')
        maps_link = f"https://www.google.com/maps?q={lat},{lng}"
        delivery_text = f"📍 *Metode:* Dijemput di lokasi Anda\n📌 *Lokasi:* {maps_link}"
        if order_data.get('alamat'):
            delivery_text += f"\n📝 *Alamat:* {order_data['alamat']}"
    else:
        delivery_text = "🏪 *Metode:* Antar sendiri ke toko"
    
    message = f"""🧺 *Holy Laundry - Pesanan Diterima*

Halo *{customer_name}*,

Pesanan Anda telah diterima! ✅

📋 *Detail Pesanan:*
- No. Order: *{order_data['order_number']}*
- Layanan: *{order_data['service_type'].replace('_', ' ').title()}*

{delivery_text}

📅 *Estimasi Selesai:* {order_data['estimasi']}
🕐 *Waktu Order:* {order_data['waktu']} WITA

⏳ *Status:* Menunggu ditimbang

💡 Cucian Anda akan ditimbang saat tiba di toko.
   Kami akan mengirimkan nota setelah penimbangan.

Terima kasih telah menggunakan Holy Laundry! 🙏

🌐 *Cek Status:* https://holy-laundry-system.vercel.app
_(Pesan otomatis dari sistem)_"""

    return await send_whatsapp_notification(
        phone, message, "order_created"
    )

async def notify_order_weighed(
    customer_name: str,
    phone: str,
    order_data: dict
):
    """Notifikasi setelah cucian ditimbang - kirim nota"""
    
    message = f"""⚖️ *Holy Laundry - Nota Pesanan*

Halo *{customer_name}*,

Cucian Anda telah ditimbang! ✅

📋 *Detail Pesanan:*
- No. Order: *{order_data['order_number']}*
- Layanan: *{order_data['service_type'].replace('_', ' ').title()}*
- Berat: *{order_data['berat']} kg*
- Harga: *Rp {order_data['harga_per_kg']:,}/kg*
- *Total: Rp {order_data['total_harga']:,}*

📅 *Estimasi Selesai:* {order_data['estimasi']}

💳 *Pembayaran:*
Anda dapat membayar sekarang atau saat mengambil cucian.

✨ Cucian Anda sedang dalam proses!

Terima kasih! 🙏

🌐 *Cek Status:* https://holy-laundry-system.vercel.app
_(Pesan otomatis dari sistem)_"""

    return await send_whatsapp_notification(
        phone, message, "order_weighed"
    )

async def notify_status_update(
    customer_name: str,
    phone: str,
    order_data: dict
):
    """Notifikasi update status cucian"""

    status_emoji = {
        'received': '📦',
        'washing': '🧼',
        'drying': '💨',
        'ironing': '👔',
        'ready': '🎉'
    }

    status_text = {
        'received': 'Diterima',
        'washing': 'Sedang Dicuci',
        'drying': 'Sedang Dikeringkan',
        'ironing': 'Sedang Disetrika',
        'ready': 'Sudah Selesai'
    }

    status = order_data['status']
    emoji = status_emoji.get(status, '📦')
    text = status_text.get(status, 'Diproses')

    message = f"""{emoji} *Holy Laundry - Update Status*

Halo *{customer_name}*,

Status cucian Anda telah diupdate!

📋 *No. Order:* {order_data['order_number']}
📊 *Status:* {text}
🕐 *Update:* {order_data['waktu']} WITA
"""
    
    if status == 'ready':
        message += """
🎉 *Yeay! Cucian Anda sudah siap!*

Silakan ambil cucian Anda di Holy Laundry.
"""
    
    message += """
Terima kasih! 🙏

🌐 *Cek Status:* https://holy-laundry-system.vercel.app
_(Pesan otomatis dari sistem)_"""
    
    return await send_whatsapp_notification(
        phone, message, "status_update"
    )

async def notify_payment_success(
    customer_name: str,
    phone: str,
    payment_data: dict
):
    """Notifikasi pembayaran berhasil"""
    
    message = f"""💳 *Holy Laundry - Pembayaran Berhasil*

Halo *{customer_name}*,

Pembayaran Anda telah berhasil! ✅

📋 *Detail Pembayaran:*
- No. Order: *{payment_data['order_number']}*
- Jumlah: *Rp {payment_data['amount']:,}*
- Metode: *{payment_data['method']}*
- Waktu: *{payment_data['waktu']} WITA*

Status: *{payment_data['order_status']}*

Terima kasih atas pembayarannya! 🙏

🌐 *Cek Status:* https://holy-laundry-system.vercel.app
_(Pesan otomatis dari sistem)_"""
    
    return await send_whatsapp_notification(
        phone, message, "payment_success"
    )