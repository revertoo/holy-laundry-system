import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Package, Clock, CheckCircle, ArrowLeft,
  Plus, CreditCard, AlertCircle
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LOGO_URL = "/images/holy-laundry-logo.png";

const convertToWITA = (utcDate) => {
  const date = new Date(utcDate);
  date.setHours(date.getHours() + 8);
  return date;
};

const STATUS_CONFIG = {
  pending_weight: {
    label: 'Menunggu Timbang',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
    icon: '⏳',
    step: 0
  },
  received: {
    label: 'Diterima',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    icon: '📦',
    step: 1
  },
  washing: {
    label: 'Sedang Dicuci',
    color: 'text-cyan-700',
    bg: 'bg-cyan-100',
    icon: '🧼',
    step: 2
  },
  drying: {
    label: 'Dikeringkan',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    icon: '💨',
    step: 3
  },
  ironing: {
    label: 'Disetrika',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    icon: '👔',
    step: 4
  },
  ready: {
    label: 'Selesai',
    color: 'text-green-700',
    bg: 'bg-green-100',
    icon: '✅',
    step: 5
  },
};

const STEPS_MAP = {
  cuci_setrika: [
    { key: 'received', label: 'Terima' },
    { key: 'washing', label: 'Cuci' },
    { key: 'drying', label: 'Kering' },
    { key: 'ironing', label: 'Setrika' },
    { key: 'ready', label: 'Selesai' }
  ],
  setrika_saja: [
    { key: 'received', label: 'Terima' },
    { key: 'ironing', label: 'Setrika' },
    { key: 'ready', label: 'Selesai' }
  ]
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    if (userData) loadOrders(userData._id);
  }, []);

  // Clean URL if Midtrans redirects back
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('transaction_status') || urlParams.get('order_id')) {
      window.history.replaceState(null, '', window.location.pathname);
      if (user) {
        // Wait a bit for webhook to arrive then reload
        setTimeout(() => loadOrders(user._id), 1500);
      }
    }
  }, [user]);

  const loadOrders = async (customerId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${API_URL}/api/orders/customer/${customerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (order) => {
    setPaymentLoading(true);
    try {
      const paymentData = await paymentService.createPaymentToken(order._id);
      paymentService.openMidtransSnap(
        paymentData.snap_token,
        async () => {
          alert('✅ Pembayaran sedang diproses! Sistem akan memperbarui status dalam beberapa saat.');
          setTimeout(() => loadOrders(user._id), 2000); // Tunggu webhook Midtrans sedikit
        },
        () => alert('⏳ Pembayaran pending. Selesaikan pembayaran Anda.'),
        () => alert('❌ Pembayaran gagal. Silakan coba lagi.')
      );
    } catch (error) {
      alert('❌ Gagal membuat pembayaran. Silakan coba lagi.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
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

      <div className="max-w-4xl mx-auto px-4 pt-8">
        {/* Title + New Order Button */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pesanan Saya</h1>
            <p className="text-gray-600 mt-1">Track status cucian Anda</p>
          </div>
          <button
            onClick={() => navigate('/customer/create-order')}
            className="flex items-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-2xl transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            Pesanan Baru
          </button>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Pesanan</h3>
            <p className="text-gray-500 mb-6">Buat pesanan pertama Anda sekarang!</p>
            <button
              onClick={() => navigate('/customer/create-order')}
              className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-2xl transition-all"
            >
              Buat Pesanan
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status_cucian] || STATUS_CONFIG.pending_weight;
              const currentStep = statusConfig.step;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                >
                  {/* Card Header */}
                  <div className="px-6 pt-6 pb-4 flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">No. Order</p>
                      <p className="text-lg font-bold text-gray-900">{order.order_number}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.icon} {statusConfig.label}
                    </span>
                  </div>

                  {/* Progress */}
                  {order.status_cucian !== 'pending_weight' && (
                    <div className="px-6 pb-7">
                      {(() => {
                        const orderSteps = STEPS_MAP[order.service_type] || STEPS_MAP.cuci_setrika;
                        const totalSteps = orderSteps.length;
                        
                        let computedCurrentStep = orderSteps.findIndex(s => s.key === order.status_cucian) + 1;
                        if (computedCurrentStep === 0 && order.status_cucian === 'ready') computedCurrentStep = totalSteps;

                        const halfStepPercent = 100 / (totalSteps * 2);
                        let progressPercentage = 0;

                        if (computedCurrentStep >= totalSteps) {
                          progressPercentage = 100;
                        } else if (computedCurrentStep > 1) {
                          progressPercentage = ((computedCurrentStep - 1 + 0.5) / (totalSteps - 1)) * 100;
                        }

                        return (
                          <div className="relative flex items-start justify-between">
                            <div
                              className="absolute top-4 h-1"
                              style={{ left: `${halfStepPercent}%`, right: `${halfStepPercent}%` }}
                            >
                              <div className="absolute inset-0 bg-gray-100 rounded-full" />
                              <div
                                className="absolute top-0 left-0 h-full bg-primary-500 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>

                            {orderSteps.map((stepObj, i) => {
                              const stepNum = i + 1;
                              const isCompleted = computedCurrentStep > stepNum;
                              const isCurrent = computedCurrentStep === stepNum;

                              return (
                                <div key={i} className="flex flex-col items-center z-10" style={{ flex: 1 }}>
                                  <div className="relative w-full flex justify-center">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${isCompleted
                                      ? 'bg-primary-500 border-primary-500 text-white shadow-md'
                                      : isCurrent
                                        ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-200/60'
                                        : 'bg-white border-gray-200 text-gray-400'
                                      }`}>
                                      {(isCompleted || isCurrent) ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      ) : (
                                        <span>{stepNum}</span>
                                      )}
                                    </div>
                                  </div>
                                  <span className={`mt-2 text-xs font-medium text-center leading-tight ${isCompleted || isCurrent ? 'text-primary-600' : 'text-gray-400'}`}>
                                    {stepObj.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Pending Weight Warning */}
                  {order.status_cucian === 'pending_weight' && (
                    <div className="mx-6 mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <p className="text-sm text-yellow-700">
                        Cucian menunggu ditimbang. Kami akan kirim nota setelah penimbangan.
                      </p>
                    </div>
                  )}

                  {/* Order Details */}
                  <div className="px-6 pb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Layanan</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {order.service_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Berat</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {order.berat !== null ? `${order.berat} kg` : (
                          <span className="text-yellow-600 italic">Belum ditimbang</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Harga</p>
                      {order.total_harga !== null ? (
                        <p className="font-bold text-primary-600">
                          Rp {order.total_harga.toLocaleString('id-ID')}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Menunggu timbang</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Pembayaran</p>
                      <span className={`text-sm font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                        {order.payment_status === 'paid' ? '✅ Lunas' : '⏳ Belum Dibayar'}
                      </span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="px-6 pb-4 flex justify-between text-sm text-gray-500">
                    <span>
                      📅 Masuk: {convertToWITA(order.tanggal_masuk).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })} • {convertToWITA(order.tanggal_masuk).toLocaleTimeString('id-ID', {
                        hour: '2-digit', minute: '2-digit'
                      })} WITA
                    </span>
                    {order.estimasi_selesai && (
                      <span>
                        ⏰ Estimasi: {convertToWITA(order.estimasi_selesai).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    )}
                  </div>

                  {/* Payment Button */}
                  {order.payment_status === 'pending' && order.total_harga !== null && (
                    <div className="px-6 pb-6">
                      <button
                        onClick={() => handlePayment(order)}
                        disabled={paymentLoading}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-2xl transition-all shadow-md disabled:opacity-50"
                      >
                        <CreditCard className="w-5 h-5" />
                        {paymentLoading ? 'Memproses...' : 'Bayar Sekarang'}
                      </button>
                    </div>
                  )}

                  {/* Paid Badge */}
                  {order.payment_status === 'paid' && (
                    <div className="px-6 pb-6">
                      <div className="flex items-center justify-center gap-2 py-3 bg-green-50 border border-green-200 rounded-2xl">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-700 font-medium">Pembayaran Berhasil</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}