import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Package, MapPin, FileText, AlertCircle,
  ArrowLeft, CheckCircle, Car, Store
} from 'lucide-react';
import LocationPicker from '../../components/customer/LocationPicker';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LOGO_URL = "/images/holy-laundry-logo.png";

const services = [
  {
    id: 'cuci_setrika',
    name: 'Cuci Setrika',
    price: 7000,
    desc: 'Cuci + setrika rapi siap pakai',
    icon: '🧺',
    features: ['Dicuci dengan detergen premium', 'Disetrika hingga rapi', 'Estimasi 2 hari']
  },
  {
    id: 'setrika_saja',
    name: 'Setrika Saja',
    price: 3000,
    desc: 'Setrika rapi tanpa cuci',
    icon: '🔥',
    features: ['Disetrika dengan presisi', 'Cocok untuk baju formal', 'Estimasi 1 hari']
  }
];

export default function CreateOrder() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [locationValid, setLocationValid] = useState(false);
  const [distance, setDistance] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const [formData, setFormData] = useState({
    service_type: 'cuci_setrika',
    is_delivery: true,
    latitude: null,
    longitude: null,
    alamat_pickup: '',
    catatan: '',
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }, []);

  const handleMapLocationSelect = (position) => {
    setFormData({ ...formData, latitude: position.lat, longitude: position.lng });
    setLocationValid(false);
  };

  const handleValidateLocation = async () => {
    if (!formData.latitude || !formData.longitude) {
      setError('Pilih lokasi terlebih dahulu');
      return;
    }
    setValidating(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_URL}/api/customers/validate-location`,
        { latitude: formData.latitude, longitude: formData.longitude },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLocationValid(true);
      setDistance(response.data.distance);
    } catch (err) {
      setError(err.response?.data?.detail || 'Lokasi di luar jangkauan (max 2 km)');
      setLocationValid(false);
      setDistance(null);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.is_delivery && !locationValid) {
      setError('Silakan validasi lokasi atau pilih "Antar Sendiri"');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const orderData = {
        customer_id: user._id,
        service_type: formData.service_type,
        is_delivery: formData.is_delivery,
        alamat_pickup: formData.is_delivery ? formData.alamat_pickup : null,
        koordinat_pickup:
          formData.is_delivery && formData.latitude && formData.longitude
            ? { latitude: parseFloat(formData.latitude), longitude: parseFloat(formData.longitude) }
            : null,
        catatan: formData.catatan || null,
      };
      await axios.post(`${API_URL}/api/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/customer/orders');
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find(s => s.id === formData.service_type);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white pt-0 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/customer/home')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali</span>
          </button>
          <div className="flex-1" />
          <img src={LOGO_URL} alt="Holy Laundry" className="h-10 w-auto"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buat Pesanan Baru</h1>
          <p className="text-gray-600">Pilih layanan dan metode pengantaran</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Pilih Layanan</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, service_type: service.id })}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${formData.service_type === service.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                >
                  <div className="text-3xl mb-3">{service.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{service.desc}</p>
                  <p className="text-xl font-bold text-primary-500">
                    Rp {service.price.toLocaleString('id-ID')}
                    <span className="text-sm text-gray-400 font-normal">/kg</span>
                  </p>
                  <ul className="mt-3 space-y-1">
                    {service.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {formData.service_type === service.id && (
                    <div className="mt-3 flex items-center gap-1 text-primary-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Dipilih</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Info Berat */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Informasi Penting:</p>
              <ul className="space-y-1 text-blue-700 list-disc list-inside">
                <li>Berat cucian akan ditimbang saat tiba di toko</li>
                <li>Nota harga dikirim setelah penimbangan</li>
                <li>Pembayaran bisa dilakukan online atau saat ambil</li>
              </ul>
            </div>
          </div>

          {/* Delivery Method */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Metode Pengantaran</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { setFormData({ ...formData, is_delivery: true }); setShowMap(true); }}
                className={`p-5 rounded-2xl border-2 text-center transition-all ${formData.is_delivery
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <Car className={`w-8 h-8 mx-auto mb-2 ${formData.is_delivery ? 'text-primary-500' : 'text-gray-400'}`} />
                <p className="font-bold text-gray-900">Dijemput</p>
                <p className="text-xs text-gray-500 mt-1">Kami jemput di lokasi Anda</p>
                <p className="text-xs text-primary-500 mt-1 font-medium">Radius 2km dari toko</p>
              </button>

              <button
                type="button"
                onClick={() => { setFormData({ ...formData, is_delivery: false }); setShowMap(false); setLocationValid(true); }}
                className={`p-5 rounded-2xl border-2 text-center transition-all ${!formData.is_delivery
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <Store className={`w-8 h-8 mx-auto mb-2 ${!formData.is_delivery ? 'text-primary-500' : 'text-gray-400'}`} />
                <p className="font-bold text-gray-900">Antar Sendiri</p>
                <p className="text-xs text-gray-500 mt-1">Antar langsung ke toko</p>
                <p className="text-xs text-gray-400 mt-1">Jl. Soka No. 12, Kapal</p>
              </button>
            </div>
          </div>

          {/* Map Picker */}
          {formData.is_delivery && showMap && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-500" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Pilih Lokasi Penjemputan</h2>
              </div>

              <LocationPicker
                onLocationSelect={handleMapLocationSelect}
                initialPosition={
                  formData.latitude && formData.longitude
                    ? { lat: formData.latitude, lng: formData.longitude }
                    : null
                }
              />

              {formData.latitude && formData.longitude && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleValidateLocation}
                    disabled={validating || locationValid}
                    className={`w-full py-3 rounded-2xl font-medium transition-all ${locationValid
                        ? 'bg-green-500 text-white cursor-not-allowed'
                        : 'bg-primary-500 hover:bg-primary-600 text-white'
                      } disabled:opacity-70`}
                  >
                    {validating ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Memvalidasi...
                      </span>
                    ) : locationValid ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Lokasi Valid ✓
                      </span>
                    ) : (
                      '🔍 Validasi Lokasi'
                    )}
                  </button>

                  {locationValid && distance && (
                    <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <p className="text-sm text-green-700">
                        Lokasi valid! Jarak dari toko:{' '}
                        <strong>{distance.toFixed(2)} km</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Address & Notes */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Informasi Tambahan</h2>
            </div>

            <div className="space-y-4">
              {formData.is_delivery && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Lengkap <span className="text-gray-400">(opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.alamat_pickup}
                    onChange={(e) => setFormData({ ...formData, alamat_pickup: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Jl. Sunset Road No. 123, Denpasar"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan <span className="text-gray-400">(opsional)</span>
                </label>
                <textarea
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                  rows="3"
                  placeholder={
                    formData.is_delivery
                      ? 'Contoh: Jemput jam 2 siang, masuk gang kiri'
                      : 'Contoh: Akan diantar besok pagi'
                  }
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-primary-50 border border-primary-200 rounded-3xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">📋 Ringkasan Pesanan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Layanan:</span>
                <span className="font-medium text-gray-900">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Harga:</span>
                <span className="font-medium text-primary-600">
                  Rp {selectedService?.price.toLocaleString('id-ID')}/kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Metode:</span>
                <span className="font-medium text-gray-900">
                  {formData.is_delivery ? '🚗 Dijemput' : '🏪 Antar Sendiri'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-primary-200">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-gray-500 italic text-xs">
                  Dihitung setelah ditimbang
                </span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/customer/home')}
              className="flex-1 py-4 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-2xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || (formData.is_delivery && !locationValid)}
              className="flex-1 py-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                '✅ Buat Pesanan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}