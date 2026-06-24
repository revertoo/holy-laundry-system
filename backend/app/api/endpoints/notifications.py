from fastapi import APIRouter, HTTPException
import json
import os
from datetime import datetime

router = APIRouter()

LOG_FILE = "whatsapp_logs.json"

def load_logs():
    """Load logs dari file"""
    try:
        if not os.path.exists(LOG_FILE):
            return []
        with open(LOG_FILE, 'r', encoding='utf8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading logs: {e}")
        return []

def save_logs(logs: list):
    """Save logs ke file"""
    try:
        with open(LOG_FILE, 'w', encoding='utf-8') as f:
            json.dump(logs, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving logs: {e}")

@router.get("/logs")
async def get_notification_logs():
    """Lihat semua notifikasi yang pending"""
    logs = load_logs()
    return {
        "logs": logs,
        "total": len(logs),
        "pending": len([l for l in logs if l.get('status') == 'pending_manual_send']),
        "sent": len([l for l in logs if l.get('status') == 'manually_sent']),
    }

@router.put("/logs/{log_id}/mark-sent")
async def mark_as_sent(log_id: int):
    """Mark notifikasi sebagai sudah dikirim manual"""
    logs = load_logs()

    if log_id < 0 or log_id >= len(logs):
        raise HTTPException(status_code=404, detail="Log tidak ditemukan")

    logs[log_id]['status'] = 'manually_sent'
    logs[log_id]['sent_at'] = datetime.now().isoformat()

    save_logs(logs)
    return{"message": "Marked as sent", "log": logs[log_id]}

@router.delete("/logs/{log_id}")
async def delete_log(log_id: int):
    """Hapus satu log"""
    logs = load_logs()

    if log_id < 0 or log_id >= len(logs):
        raise HTTPException(status_code=404, detail="Log tidak ditemukan")
    
    deleted = logs.pop(log_id)
    save_logs(logs)
    return {"message": "Log deleted", "deleted": deleted}

@router.delete("/logs")
async def clear_all_logs():
    """Clear semua logs"""
    save_logs([])
    return {"message": "All logs cleared"}