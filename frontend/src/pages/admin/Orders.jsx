import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {

  Package, Search, Scale, User, MapPin,
  Calendar, Trash2, CheckCircle, LogOut,
  Bell, Filter, ArrowLeft, Clock
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LOGO_URL = "/images/holy-laundry-logo.png";

const convertToWITA = (utcDate) => {
  const date = new Date(utcDate);
  date.setHours(date.getHours() + 8);
  return date;
};

const STATUS_CONFIG = {
  pending_weight: { label: '⏳ Menunggu Timbang', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  received:       { label: '📦 Diterima',          bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200'   },
  washing:        { label: '🧼 Dicuci',             bg: 'bg-cyan-100',   text: 'text-cyan-700',   border: 'border-cyan-200'   },
  drying:         { label: '💨 Dikeringkan',        bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  ironing:        { label: '👔 Disetrika',          bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  ready:          { label: '✅ Selesai',             bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200'  },
};

const STATUS_BUTTONS = [
  { label: '🧼 Dicuci',     value: 'washing' },
  { label: '💨 Dikeringkan', value: 'drying'  },
  { label: '👔 Disetrika',   value: 'ironing' },
  { label: '✅ Selesai',     value: 'ready'   },
];

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [weightInput, setWeightInput] = useState('');
  const [weightLoading, setWeightLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadOrders();
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

  const loadCustomer = async (customerId) => {
    if (customers[customerId]) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(
        `${API_URL}/api/customers/${customerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCustomers(prev => ({ ...prev, [customerId]: res.data }));
    } catch (e) {}
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
      alert('✅ Status berhasil diupdate!');
      await loadOrders();
      setSelectedOrder(null);
    } catch (e) {
      alert('❌ Gagal update status');
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm('Yakin ingin menghapus pesanan ini?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Pesanan berhasil dihapus!');
      await loadOrders();
      setSelectedOrder(null);
    } catch (e) {
      alert('❌ Gagal menghapus pesanan');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Filter counts
  const counts = {
    all: orders.length,
    pending_weight: orders.filter(o => o.status_cucian === 'pending_weight').length,
    processing: orders.filter(o => !['ready', 'pending_weight'].includes(o.status_cucian)).length,
    ready: orders.filter(o => o.status_cucian === 'ready').length,
  };

  // Apply filters
  const filteredOrders = orders.filter(o => {
    const matchSearch = o.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'pending_weight' ? o.status_cucian === 'pending_weight' :
      filter === 'processing' ? !['ready', 'pending_weight'].includes(o.status_cucian) :
      filter === 'ready' ? o.status_cucian === 'ready' : true;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-500 hover:text-primary-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img src={LOGO_URL} alt="Holy Laundry" className="h-10 w-auto"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Manajemen Pesanan</h1>
                <p className="text-xs text-gray-500">Holy Laundry Admin Panel</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/notifications')}
                className="p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all"
              >
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Alert Pending Weight */}
        {counts.pending_weight > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-2xl flex items-center gap-3">
            <Scale className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-yellow-800 font-medium">
              {counts.pending_weight} pesanan menunggu ditimbang!
            </p>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nomor order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all',           label: 'Semua',          count: counts.all           },
                { key: 'pending_weight', label: '⏳ Timbang',    count: counts.pending_weight },
                { key: 'processing',    label: '🔄 Diproses',    count: counts.processing    },
                { key: 'ready',         label: '✅ Selesai',     count: counts.ready         },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === f.key
                      ? f.key === 'pending_weight'
                        ? 'bg-yellow-500 text-white'
                        : f.key === 'ready'
                        ? 'bg-green-500 text-white'
                        : f.key === 'processing'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                  <span className={`px-1.5 py-0.5 rounded-lg text-xs font-bold ${
                    filter === f.key ? 'bg-white/20 text-white' : 'bg-white text-gray-600'
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center">
              <Package className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Tidak ada pesanan</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery ? 'Coba kata kunci lain' : 'Belum ada pesanan masuk'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['No. Order', 'Layanan', 'Berat', 'Total', 'Status Cucian', 'Pembayaran', 'Tanggal Masuk', 'Aksi'].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order) => {
                    const sc = STATUS_CONFIG[order.status_cucian] || STATUS_CONFIG.pending_weight;
                    return (
                      <tr
                        key={order._id}
                        className={`hover:bg-gray-50/80 transition-colors ${
                          order.status_cucian === 'pending_weight' ? 'bg-yellow-50/40' : ''
                        }`}
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-gray-900">{order.order_number}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {order.is_delivery ? '🚗 Dijemput' : '🏪 Antar Sendiri'}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700 capitalize">
                          {order.service_type.replace('_', ' ')}
                        </td>
                        <td className="px-5 py-4 text-sm">
                          {order.berat !== null ? (
                            <span className="font-medium text-gray-900">{order.berat} kg</span>
                          ) : (
                            <span className="text-yellow-600 text-xs italic font-medium">Belum timbang</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm">
                          {order.total_harga !== null ? (
                            <span className="font-bold text-gray-900">
                              Rp {order.total_harga.toLocaleString('id-ID')}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                            order.payment_status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {order.payment_status === 'paid' ? '✅ Lunas' : '⏳ Belum Lunas'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm">
                          <p className="text-gray-700 text-xs font-medium">
                            {convertToWITA(order.tanggal_masuk).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {convertToWITA(order.tanggal_masuk).toLocaleTimeString('id-ID', {
                              hour: '2-digit', minute: '2-digit'
                            })} WITA
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleViewDetail(order)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
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

          {/* Table Footer */}
          {filteredOrders.length > 0 && (
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <p className="text-sm text-gray-500">
                Menampilkan <span className="font-medium text-gray-700">{filteredOrders.length}</span> dari{' '}
                <span className="font-medium text-gray-700">{orders.length}</span> pesanan
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETAIL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">

              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Detail Pesanan</h2>
                  <p className="text-sm text-gray-400 mt-1">{selectedOrder.order_number}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all text-lg"
                >
                  ✕
                </button>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-3 mb-6">
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
                <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                  {selectedOrder.is_delivery ? '🚗 Dijemput' : '🏪 Antar Sendiri'}
                </span>
              </div>

              {/* Customer Info */}
              {customers[selectedOrder.customer_id] && (
                <div className="mb-5 p-5 bg-primary-50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-primary-500" />
                    <h3 className="font-bold text-gray-900 text-sm">Informasi Customer</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Nama</p>
                      <p className="font-semibold text-gray-900">
                        {customers[selectedOrder.customer_id].nama}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">No. HP</p>
                      <p className="font-semibold text-gray-900">
                        {customers[selectedOrder.customer_id].no_hp}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500 text-xs">Email</p>
                      <p className="font-semibold text-gray-900">
                        {customers[selectedOrder.customer_id].email}
                      </p>
                    </div>
                  </div>

                  {/* Maps Link */}
                  {selectedOrder.is_delivery && selectedOrder.koordinat_pickup && (
                    <a
                      href={`https://www.google.com/maps?q=${selectedOrder.koordinat_pickup.latitude},${selectedOrder.koordinat_pickup.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium transition-all"
                    >
                      <MapPin className="w-4 h-4" />
                      Buka Lokasi di Google Maps
                    </a>
                  )}
                </div>
              )}

              {/* INPUT BERAT */}
              {selectedOrder.status_cucian === 'pending_weight' && (
                <div className="mb-5 p-5 bg-yellow-50 border-2 border-yellow-300 rounded-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Scale className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-bold text-gray-900">Input Berat Cucian</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Layanan:{' '}
                    <strong>
                      {selectedOrder.service_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </strong>
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
                        <p className="text-xs text-gray-500">Total Harga</p>
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
                    * Notifikasi ke log WhatsApp otomatis dikirim
                  </p>
                </div>
              )}

              {/* Order Details */}
              {selectedOrder.status_cucian !== 'pending_weight' && (
                <div className="mb-5 p-5 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-4 h-4 text-primary-500" />
                    <h3 className="font-bold text-gray-900 text-sm">Detail Pesanan</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Layanan</p>
                      <p className="font-semibold text-gray-900">
                        {selectedOrder.service_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Berat</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.berat} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Harga/kg</p>
                      <p className="font-semibold text-gray-900">
                        Rp {selectedOrder.harga_per_kg?.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Total Harga</p>
                      <p className="font-bold text-primary-600 text-lg">
                        Rp {selectedOrder.total_harga?.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.catatan && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-gray-500 text-xs">Catatan Customer:</p>
                      <p className="text-gray-700 italic text-sm mt-1">{selectedOrder.catatan}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tanggal */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="p-4 bg-primary-50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <p className="text-xs font-semibold text-gray-700">Tanggal Masuk</p>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">
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
                    <Clock className="w-4 h-4 text-orange-500" />
                    <p className="text-xs font-semibold text-gray-700">Estimasi Selesai</p>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">
                    {convertToWITA(selectedOrder.estimasi_selesai).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Update Status */}
              {selectedOrder.status_cucian !== 'pending_weight' && (
                <div className="mb-5 p-5 border-2 border-primary-100 rounded-2xl">
                  <h3 className="font-bold text-gray-900 mb-1">🔄 Update Status Cucian</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Status saat ini:{' '}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[selectedOrder.status_cucian]?.bg} ${STATUS_CONFIG[selectedOrder.status_cucian]?.text}`}>
                      {STATUS_CONFIG[selectedOrder.status_cucian]?.label}
                    </span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_BUTTONS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => handleUpdateStatus(selectedOrder._id, s.value)}
                        disabled={selectedOrder.status_cucian === s.value}
                        className={`py-3 rounded-2xl text-sm font-semibold transition-all ${
                          selectedOrder.status_cucian === s.value
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(selectedOrder._id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-medium transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus Pesanan
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-medium transition-all"
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