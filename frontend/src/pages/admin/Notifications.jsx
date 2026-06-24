import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  Bell, ArrowLeft, Trash2, CheckCircle,
  Clock, Phone, MessageSquare, LogOut,
  Search, RefreshCw
} from 'lucide-react';

const LOGO_URL = "/images/holy-laundry-logo.png";

const MESSAGE_TYPE_CONFIG = {
  order_created:  { label: 'Pesanan Baru',  bg: 'bg-blue-100',   text: 'text-blue-700',   icon: '🛍️' },
  order_weighed:  { label: 'Nota Timbang',  bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '⚖️' },
  status_update:  { label: 'Update Status', bg: 'bg-purple-100', text: 'text-purple-700', icon: '🔄' },
  payment_success:{ label: 'Pembayaran',    bg: 'bg-green-100',  text: 'text-green-700',  icon: '💳' },
  general:        { label: 'Notifikasi',    bg: 'bg-gray-100',   text: 'text-gray-700',   icon: '📢' },
};

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export default function Notifications() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, sent: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLog, setExpandedLog] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(
        `${API_URL}/api/notifications/logs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLogs(res.data.logs || []);
      setStats({
        total: res.data.total || 0,
        pending: res.data.pending || 0,
        sent: res.data.sent || 0,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSent = async (logId) => {
    setActionLoading(logId);
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(
        `${API_URL}/api/notifications/logs/${logId}/mark-sent`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadLogs();
    } catch (e) {
      alert('❌ Gagal update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!confirm('Hapus log ini?')) return;
    setActionLoading(logId);
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `${API_URL}/api/notifications/logs/${logId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadLogs();
    } catch (e) {
      alert('❌ Gagal hapus log');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Hapus SEMUA log? Aksi ini tidak bisa dibatalkan.')) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `${API_URL}/api/notifications/logs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadLogs();
    } catch (e) {
      alert('❌ Gagal clear logs');
    }
  };

  const handleCopyMessage = (message) => {
    navigator.clipboard.writeText(message);
    alert('✅ Pesan disalin! Buka WhatsApp dan kirim manual.');
  };

  const handleOpenWhatsApp = (phone, message) => {
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${formattedPhone}?text=${encodedMsg}`, '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Filter & Search
  const filteredLogs = [...logs]
    .reverse()
    .filter((log) => {
      const matchFilter =
        filter === 'all' ? true :
        filter === 'pending' ? log.status === 'pending_manual_send' :
        filter === 'sent' ? log.status === 'manually_sent' : true;

      const matchSearch =
        !searchQuery ||
        log.phone?.includes(searchQuery) ||
        log.message?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchFilter && matchSearch;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img src={LOGO_URL} alt="Holy Laundry" className="h-10 w-auto"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Notifikasi WhatsApp
                </h1>
                <p className="text-xs text-gray-500">Log pesan ke customer</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadLogs}
                className="p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
          <Bell className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Mode Development - Log Notifikasi</p>
            <p className="text-blue-600">
              WhatsApp automation dinonaktifkan sementara. Semua pesan tersimpan di sini.
              Klik <strong>"Buka WhatsApp"</strong> untuk kirim manual, lalu tandai sebagai terkirim.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: 'Total Notifikasi',
              value: stats.total,
              icon: <MessageSquare className="w-5 h-5 text-gray-500" />,
              bg: 'bg-gray-100',
              color: 'text-gray-900'
            },
            {
              label: 'Belum Dikirim',
              value: stats.pending,
              icon: <Clock className="w-5 h-5 text-yellow-500" />,
              bg: 'bg-yellow-100',
              color: 'text-yellow-600'
            },
            {
              label: 'Sudah Dikirim',
              value: stats.sent,
              icon: <CheckCircle className="w-5 h-5 text-green-500" />,
              bg: 'bg-green-100',
              color: 'text-green-600'
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters & Search & Clear */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nomor HP atau isi pesan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              {[
                { key: 'all',     label: 'Semua',    count: stats.total   },
                { key: 'pending', label: '⏳ Pending', count: stats.pending },
                { key: 'sent',    label: '✅ Terkirim', count: stats.sent   },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === f.key
                      ? f.key === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : f.key === 'sent'
                        ? 'bg-green-500 text-white'
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

            {/* Clear All */}
            {logs.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Semua
              </button>
            )}
          </div>
        </div>

        {/* Logs List */}
        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-100">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Memuat notifikasi...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Tidak ada notifikasi</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery ? 'Coba kata kunci lain' : 'Log kosong'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const logId = log.id ?? 0;
              const isExpanded = expandedLog === logId;
              const isPending = log.status === 'pending_manual_send';
              const typeConfig = MESSAGE_TYPE_CONFIG[log.message_type] || MESSAGE_TYPE_CONFIG.general;

              return (
                <div
                  key={logId}
                  className={`bg-white rounded-3xl shadow-sm border-2 transition-all ${
                    isPending ? 'border-yellow-200' : 'border-green-100'
                  }`}
                >
                  {/* Log Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Status Badge */}
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          isPending
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {isPending ? '⏳ Belum Dikirim' : '✅ Sudah Dikirim'}
                        </span>

                        {/* Message Type Badge */}
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.text}`}>
                          {typeConfig.icon} {typeConfig.label}
                        </span>

                        {/* Phone */}
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="font-medium">{log.phone}</span>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>

                    {/* Sent at */}
                    {log.sent_at && (
                      <p className="text-xs text-green-600 mb-3">
                        ✅ Dikirim pada: {formatDate(log.sent_at)}
                      </p>
                    )}

                    {/* Message Preview */}
                    <div
                      className={`bg-gray-50 rounded-2xl p-4 text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed relative overflow-hidden ${
                        !isExpanded ? 'max-h-20' : ''
                      }`}
                    >
                      {log.message}
                      {!isExpanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-50 to-transparent" />
                      )}
                    </div>

                    {/* Toggle expand */}
                    <button
                      onClick={() => setExpandedLog(isExpanded ? null : logId)}
                      className="mt-2 text-xs text-primary-500 hover:text-primary-600 font-medium"
                    >
                      {isExpanded ? '▲ Sembunyikan' : '▼ Lihat pesan lengkap'}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="px-5 pb-5 flex flex-wrap gap-2">
                    {/* Buka WhatsApp */}
                    <button
                      onClick={() => handleOpenWhatsApp(log.phone, log.message)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      Buka WhatsApp
                    </button>

                    {/* Copy */}
                    <button
                      onClick={() => handleCopyMessage(log.message)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-all border border-gray-200"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Copy Pesan
                    </button>

                    {/* Mark as Sent */}
                    {isPending && (
                      <button
                        onClick={() => handleMarkSent(logId)}
                        disabled={actionLoading === logId}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-xl text-sm font-medium transition-all border border-yellow-200 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {actionLoading === logId ? 'Loading...' : 'Tandai Terkirim'}
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteLog(logId)}
                      disabled={actionLoading === logId}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-all border border-red-200 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Count */}
        {filteredLogs.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Menampilkan <span className="font-medium text-gray-600">{filteredLogs.length}</span> dari{' '}
              <span className="font-medium text-gray-600">{stats.total}</span> notifikasi
            </p>
          </div>
        )}
      </div>
    </div>
  );
}