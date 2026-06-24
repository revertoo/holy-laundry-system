import math
from typing import Dict

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two coordinates using Haversine formula
    Returns distance in kilometers
    """
    R = 6371  # Radius bumi dalam kilometer
    
    # Convert degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    distance = R * c
    return round(distance, 2)

def is_within_radius(
    customer_lat: float, 
    customer_lon: float, 
    store_lat: float, 
    store_lon: float, 
    max_radius_km: float = 2.0
) -> Dict:
    """
    Check if customer location is within delivery radius
    Returns dict with: {valid: bool, distance: float, message: str}
    """
    distance = haversine_distance(store_lat, store_lon, customer_lat, customer_lon)
    
    valid = distance <= max_radius_km
    
    return {
        "valid": valid,
        "distance": distance,
        "max_radius": max_radius_km,
        "message": f"Jarak Anda: {distance} km dari Holy Laundry" if valid else f"Maaf, alamat Anda {distance} km dari toko (maksimal {max_radius_km} km)"
    }