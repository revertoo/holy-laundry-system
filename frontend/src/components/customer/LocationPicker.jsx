import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Store location (Holy Laundry)
const STORE_LOCATION = {
    lat: -8.570795064584944,
    lng: 115.17800360157234,
};

const MAX_RADIUS_KM = 2;
const MAX_RADIUS_METERS = MAX_RADIUS_KM * 1000;

// Draggable marker component
function DraggableMarker({ position, onPositionChange }) {
    const markerRef = useRef(null);

    const eventHandlers = {
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const newPos = marker.getLatLng();
                onPositionChange(newPos);
            }
        },
    };

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    );
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        },
    });
    return null;
}

export default function LocationPicker({ onLocationSelect, initialPosition }) {
    const [position, setPosition] = useState(
        initialPosition || STORE_LOCATION
    );
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const handlePositionChange = (newPos) => {
        setPosition(newPos);
        onLocationSelect(newPos);
    };

    const getCurrentLocation = () => {
        setIsGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newPos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setPosition(newPos);
                    onLocationSelect(newPos);
                    setIsGettingLocation(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Gagal mendapatkan lokasi. Pastikan GPS aktif dan izinkan akses lokasi');
                    setIsGettingLocation(false);
                }
            );
        } else {
            alert('Browser tidak mendukung geolocation');
            setIsGettingLocation(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Map Container */}
            <div className="relative rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg">
                <MapContainer
                    center={position}
                    zoom={15}
                    style={{ height: '400px', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Store location circle (2km radius) */}
                    <Circle
                        center={STORE_LOCATION}
                        radius={MAX_RADIUS_METERS}
                        pathOptions={{
                            color: '#10B981',
                            fillColor: '#10B981',
                            fillOpacity: 0.1,
                            weight: 2,
                        }}
                    />

                    {/* Store marker */}
                    <Marker position={STORE_LOCATION}>
                        <div className="bg-white p-2 rounded shadow">
                            🏪 Holy Laundry
                        </div>
                    </Marker>

                    {/* User's draggable marker */}
                    <DraggableMarker
                        position={position}
                        onPositionChange={handlePositionChange}
                    />

                    {/* Click handler */}
                    <MapClickHandler onLocationSelect={handlePositionChange} />
                </MapContainer>

                {/* Loading overlay */}
                {isGettingLocation && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
                        <div className="bg-white rounded-xl p-6 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                            <p className="text-gray-700 font-medium">Mendapatkan lokasi Anda...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Instructions & Button */}
            <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                        <strong>📍 Cara menggunakan:</strong>
                        <br />
                        • Klik tombol "📍 Gunakan Lokasi Saya" untuk deteksi otomatis
                        <br />
                        • Atau klik pada peta untuk memilih lokasi
                        <br />
                        • Atau drag marker (pin merah) ke lokasi yang diinginkan
                        <br />• Lokasi harus dalam radius hijau (2km dari toko)
                    </p>
                </div>

                <button
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="w-full px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGettingLocation ? '⏳ Mendapatkan lokasi...' : '📍 Gunakan Lokasi Saya'}
                </button>

                <div className="text-center text-sm text-gray-600">
                    <p>Koordinat saat ini:</p>
                    <p className="font-mono text-xs">
                        {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                    </p>
                </div>
            </div>
        </div>
    );
}
