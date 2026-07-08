import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {

  ShoppingCart, DollarSign, Package, TrendingUp,
  LogOut, Search, User, MapPin, Calendar,
  Trash2, CheckCircle, Scale, Bell, ChevronRight,
  ArrowRight, Clock
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LOGO_URL = "/images/holy-laundry-logo.png";

const convertToWITA = (utcDate) => {
  const date = new Date(utcDate);
  date.setHours(date.getHours() + 8);
  return date;
};

const STATUS_CONFIG = {
  pending_weight: { label: '⏳ Menunggu Timbang', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  received:       { label: '📦 Diterima',          bg: 'bg-blue-100',   text: 'text-blue-700'   },
  washing:        { label: '🧼 Dicuci',             bg: 'bg-cyan-100',   text: 'text-cyan-700'   },
  drying:         { label: '💨 Dikeringkan',        bg: 'bg-orange-100', text: 'text-orange-700' },
  ironing:        { label: '👔 Disetrika',          bg: 'bg-purple-100', text: 'text-purple-700' },
  ready:          { label: '✅ Selesai',             bg: 'bg-green-100',  text: 'text-green-700'  },
};

const STATUS_BUTTONS_MAP = {
  cuci_setrika: [
    { label: '🧼 Dicuci', value: 'washing' },
    { label: '💨 Kering', value: 'drying' },
    { label: '👔 Setrika', value: 'ironing' },
    { label: '✅ Selesai', value: 'ready' },
  ],
  setrika_saja: [
    { label: '👔 Setrika', value: 'ironing' },
    { label: '✅ Selesai', value: 'ready' },
  ]
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [weightInput, setWeightInput] = useState('');
  const [weightLoading, setWeightLoading] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadOrders();
    loadNotifCount();
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/api/orders/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifCount = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/api/notifications/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifCount(res.data.pending || 0);
    } catch (e) {}
  };

  const loadCustomer = async (customerId) => {
    if (customers[customerId]) return customers[customerId];
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(
        `${API_URL}/api/customers/${customerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCustomers(prev => ({ ...prev, [customerId]: res.data }));
      return res.data;
    } catch (e) { return null; }
  };

  const handleViewDetail = async (order) => {
    setSelectedOrder(order);
    setWeightInput('');
    await loadCustomer(order.customer_id);
  };

  const handleInputWeight = async () => {
    if (!weightInput || parseFloat(weightInput) <= 0) {
      alert('Masukkan berat yang valid!');
      return;
    }
    setWeightLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(
        `${API_URL}/api/orders/${selectedOrder._id}/weight`,
        { berat: parseFloat(weightInput) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const harga = selectedOrder.service_type === 'cuci_setrika' ? 7000 : 3000;
      const total = parseFloat(weightInput) * harga;
      alert(`✅ Berat tersimpan!\n\nBerat: ${weightInput} kg\nTotal: Rp ${total.toLocaleString('id-ID')}\n\nNotifikasi dikirim ke log.`);
      await loadOrders();
      setSelectedOrder(null);
    } catch (e) {
      alert('❌ Gagal: ' + (e.response?.data?.detail || 'Error'));
    } finally {
      setWeightLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(
        `${API_URL}/api/orders/${orderId}/status`,
        { status_cucian: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Status diupdate!');
      await loadOrders();
      setSelectedOrder(null);
    } catch (e) {
      alert('❌ Gagal update status');
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm('Yakin hapus pesanan ini?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Pesanan dihapus!');
      await loadOrders();
      setSelectedOrder(null);
    } catch (e) {
      alert('❌ Gagal hapus');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Metrics
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o =>
    new Date(convertToWITA(o.tanggal_masuk)).toDateString() === today
  ).length;
  const totalRevenue = orders
    .filter(o => o.payment_status === 'paid')
    .reduce((sum, o) => sum + (o.total_harga || 0), 0);
  const processingOrders = orders.filter(o =>
    !['ready', 'pending_weight'].includes(o.status_cucian)
  ).length;
  const pendingWeight = orders.filter(o => o.status_cucian === 'pending_weight').length;

  const filteredOrders = orders.filter(o =>
    o.order_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentOrders = filteredOrders.slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src={LOGO_URL} alt="Holy Laundry" className="h-12 w-auto"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Selamat datang, {user?.nama}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button
                onClick={() => navigate('/admin/notifications')}
                className="relative p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all"
              >
                <Bell className="w-6 h-6" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {notifCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/admin/orders')}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-xl font-medium text-sm transition-all"
              >
                <Package className="w-4 h-4" />
                Kelola Pesanan
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-medium text-sm transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Alert: Menunggu Timbang */}
        {pendingWeight > 0 && (
          <div
            onClick={() => navigate('/admin/orders')}
            className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-yellow-100 transition-all"
          >
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800 font-medium">
                {pendingWeight} pesanan menunggu ditimbang!
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-yellow-600" />
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Pesanan Hari Ini',
              value: todayOrders,
              icon: <ShoppingCart className="w-6 h-6 text-primary-500" />,
              bg: 'bg-primary-100',
              color: 'text-primary-600'
            },
            {
              label: 'Total Pesanan',
              value: orders.length,
              icon: <Package className="w-6 h-6 text-purple-500" />,
              bg: 'bg-purple-100',
              color: 'text-purple-600'
            },
            {
              label: 'Total Pendapatan',
              value: `Rp ${totalRevenue.toLocaleString('id-ID')}`,
              icon: <DollarSign className="w-6 h-6 text-green-500" />,
              bg: 'bg-green-100',
              color: 'text-green-600',
              small: true
            },
            {
              label: 'Sedang Diproses',
              value: processingOrders,
              icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
              bg: 'bg-orange-100',
              color: 'text-orange-600'
            },
          ].map((metric, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                <div className={`w-10 h-10 ${metric.bg} rounded-xl flex items-center justify-center`}>
                  {metric.icon}
                </div>
              </div>
              <p className={`font-bold ${metric.color} ${metric.small ? 'text-lg' : 'text-3xl'}`}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/orders')}
            className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 text-white text-left hover:shadow-lg transition-all group"
          >
            <Package className="w-8 h-8 mb-3 opacity-80" />
            <p className="font-bold text-lg">Kelola Pesanan</p>
            <p className="text-primary-100 text-sm mt-1">Update status & input berat</p>
            <div className="flex items-center gap-1 mt-3 text-sm font-medium group-hover:gap-2 transition-all">
              Buka <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/notifications')}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md transition-all group relative"
          >
            {notifCount > 0 && (
              <span className="absolute top-4 right-4 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                {notifCount} pending
              </span>
            )}
            <Bell className="w-8 h-8 mb-3 text-primary-500" />
            <p className="font-bold text-gray-900 text-lg">Notifikasi WhatsApp</p>
            <p className="text-gray-500 text-sm mt-1">Log pesan ke customer</p>
            <div className="flex items-center gap-1 mt-3 text-sm font-medium text-primary-500 group-hover:gap-2 transition-all">
              Lihat Log <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <Clock className="w-8 h-8 mb-3 text-primary-500" />
            <p className="font-bold text-gray-900 text-lg">Jam Operasional</p>
            <div className="mt-2 space-y-1 text-sm text-gray-500">
              <p>⏰ Senin - Jumat: 08.00 - 18.00</p>
              <p>⏰ Sabtu: 08.00 - 16.00</p>
              <p>🔴 Minggu: Libur</p>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Pesanan Terbaru</h2>
              <p className="text-sm text-gray-500">
                {orders.length} total pesanan
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nomor order..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm w-52"
                />
              </div>
              <button
                onClick={() => navigate('/admin/orders')}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-all"
              >
                Lihat Semua
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada pesanan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['No. Order', 'Layanan', 'Berat', 'Total', 'Status', 'Bayar', 'Tanggal', 'Aksi'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => {
                    const sc = STATUS_CONFIG[order.status_cucian] || STATUS_CONFIG.pending_weight;
                    return (
                      <tr
                        key={order._id}
                        className={`hover:bg-gray-50 transition-colors ${
                          order.status_cucian === 'pending_weight' ? 'bg-yellow-50/50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">
                          {order.order_number}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                          {order.service_type.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {order.berat !== null ? `${order.berat} kg` : (
                            <span className="text-yellow-600 text-xs italic">Belum timbang</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {order.total_harga !== null
                            ? `Rp ${order.total_harga.toLocaleString('id-ID')}`
                            : <span className="text-gray-400 text-xs italic">-</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.payment_status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {order.payment_status === 'paid' ? 'Lunas' : 'Belum Lunas'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-gray-700 text-xs">
                            {convertToWITA(order.tanggal_masuk).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {convertToWITA(order.tanggal_masuk).toLocaleTimeString('id-ID', {
                              hour: '2-digit', minute: '2-digit'
                            })} WITA
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewDetail(order)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                              order.status_cucian === 'pending_weight'
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                            }`}
                          >
                            {order.status_cucian === 'pending_weight' ? '⚖️ Timbang' : 'Detail'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL DETAIL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Detail Pesanan</h2>
                  <p className="text-sm text-gray-500 mt-1">{selectedOrder.order_number}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Customer Info */}
              {customers[selectedOrder.customer_id] && (
                <div className="mb-5 p-5 bg-primary-50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-primary-500" />
                    <h3 className="font-bold text-gray-900">Informasi Customer</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Nama</p>
                      <p className="font-medium text-gray-900">{customers[selectedOrder.customer_id].nama}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">No. HP</p>
                      <p className="font-medium text-gray-900">{customers[selectedOrder.customer_id].no_hp}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{customers[selectedOrder.customer_id].email}</p>
                    </div>
                  </div>

                  {/* Maps Link */}
                  {selectedOrder.is_delivery && selectedOrder.koordinat_pickup && (
                    <a
                      href={`https://www.google.com/maps?q=${selectedOrder.koordinat_pickup.latitude},${selectedOrder.koordinat_pickup.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium transition-all"
                    >
                      <MapPin className="w-4 h-4" />
                      Buka Lokasi di Google Maps
                    </a>
                  )}
                </div>
              )}

              {/* Status Badge */}
              <div className="flex items-center gap-3 mb-5">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${STATUS_CONFIG[selectedOrder.status_cucian]?.bg} ${STATUS_CONFIG[selectedOrder.status_cucian]?.text}`}>
                  {STATUS_CONFIG[selectedOrder.status_cucian]?.label}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedOrder.payment_status === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {selectedOrder.payment_status === 'paid' ? '✅ Lunas' : '⏳ Belum Lunas'}
                </span>
              </div>

              {/* Input Berat - HANYA jika pending_weight */}
              {selectedOrder.status_cucian === 'pending_weight' && (
                <div className="mb-5 p-5 bg-yellow-50 border-2 border-yellow-300 rounded-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Scale className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-bold text-gray-900">Input Berat Cucian</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Layanan: <strong>{selectedOrder.service_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</strong>
                    {' '}@ Rp {selectedOrder.service_type === 'cuci_setrika' ? '7.000' : '3.000'}/kg
                  </p>

                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Berat (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        placeholder="Contoh: 3.5"
                        className="w-full px-4 py-3 border-2 border-yellow-300 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none text-lg"
                      />
                    </div>

                    {weightInput && parseFloat(weightInput) > 0 && (
                      <div className="bg-white border-2 border-yellow-300 rounded-2xl p-3 text-center min-w-[130px]">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-lg font-bold text-primary-600">
                          Rp {(
                            parseFloat(weightInput) *
                            (selectedOrder.service_type === 'cuci_setrika' ? 7000 : 3000)
                          ).toLocaleString('id-ID')}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleInputWeight}
                    disabled={weightLoading || !weightInput}
                    className="mt-4 w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl font-medium transition-all disabled:opacity-50"
                  >
                    {weightLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Menyimpan...
                      </span>
                    ) : '⚖️ Simpan Berat & Kirim Nota'}
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    * Notifikasi ke log WhatsApp akan otomatis dikirim
                  </p>
                </div>
              )}

              {/* Order Details */}
              {selectedOrder.status_cucian !== 'pending_weight' && (
                <div className="mb-5 p-5 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-primary-500" />
                    <h3 className="font-bold text-gray-900">Detail Pesanan</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Layanan</p>
                      <p className="font-medium text-gray-900">
                        {selectedOrder.service_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Berat</p>
                      <p className="font-medium text-gray-900">{selectedOrder.berat} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Harga/kg</p>
                      <p className="font-medium text-gray-900">
                        Rp {selectedOrder.harga_per_kg?.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Harga</p>
                      <p className="font-bold text-primary-600 text-lg">
                        Rp {selectedOrder.total_harga?.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.catatan && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-gray-500 text-sm">Catatan:</p>
                      <p className="text-gray-700 italic text-sm">{selectedOrder.catatan}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="p-4 bg-primary-50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <p className="text-sm font-medium text-gray-700">Tanggal Masuk</p>
                  </div>
                  <p className="font-bold text-gray-900">
                    {convertToWITA(selectedOrder.tanggal_masuk).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {convertToWITA(selectedOrder.tanggal_masuk).toLocaleTimeString('id-ID', {
                      hour: '2-digit', minute: '2-digit'
                    })} WITA
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                    <p className="text-sm font-medium text-gray-700">Estimasi Selesai</p>
                  </div>
                  <p className="font-bold text-gray-900">
                    {convertToWITA(selectedOrder.estimasi_selesai).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Update Status */}
              {selectedOrder.status_cucian !== 'pending_weight' && (
                <div className="mb-5 p-5 border-2 border-primary-100 rounded-2xl">
                  <h3 className="font-bold text-gray-900 mb-3">🔄 Update Status Cucian</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Status saat ini:{' '}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[selectedOrder.status_cucian]?.bg} ${STATUS_CONFIG[selectedOrder.status_cucian]?.text}`}>
                      {STATUS_CONFIG[selectedOrder.status_cucian]?.label}
                    </span>
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(STATUS_BUTTONS_MAP[selectedOrder.service_type] || STATUS_BUTTONS_MAP.cuci_setrika).map((s) => (
                      <button
                        key={s.value}
                        onClick={() => handleUpdateStatus(selectedOrder._id, s.value)}
                        disabled={selectedOrder.status_cucian === s.value}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          selectedOrder.status_cucian === s.value
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-500 hover:bg-primary-600 text-white'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(selectedOrder._id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-medium transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-medium transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}