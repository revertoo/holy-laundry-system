import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, ArrowRight, Clock, CheckCircle,
    Star, Bell, LogOut, User, ChevronRight,
    Sparkles, Shield
} from 'lucide-react';

const LOGO_URL = "/images/holy-laundry-logo.png";

const services = [
    {
        id: 'cuci_setrika',
        name: 'Cuci Setrika',
        price: 7000,
        desc: 'Cuci + setrika rapi siap pakai',
        icon: '🧺',
        color: 'from-cyan-500 to-cyan-600',
        lightColor: 'bg-cyan-50',
        textColor: 'text-cyan-600',
    },
    {
        id: 'setrika_saja',
        name: 'Setrika Saja',
        price: 3000,
        desc: 'Setrika rapi tanpa cuci',
        icon: '🔥',
        color: 'from-orange-400 to-orange-500',
        lightColor: 'bg-orange-50',
        textColor: 'text-orange-600',
    },
];

const features = [
    { icon: <Sparkles className="w-5 h-5 text-cyan-500" />, text: 'Kualitas Premium' },
    { icon: <Clock className="w-5 h-5 text-cyan-500" />, text: 'Tepat Waktu' },
    { icon: <Shield className="w-5 h-5 text-cyan-500" />, text: 'Aman & Terpercaya' },
];

export default function CustomerHome() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);

        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Selamat Pagi');
        else if (hour < 15) setGreeting('Selamat Siang');
        else if (hour < 18) setGreeting('Selamat Sore');
        else setGreeting('Selamat Malam');
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <img
                        src={LOGO_URL}
                        alt="Holy Laundry"
                        className="h-10 w-auto"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                                {user?.nama?.split(' ')[0]}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Hero/Greeting Card */}
                <div className="relative bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-6 text-white overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                    <div className="absolute bottom-0 right-12 w-20 h-20 bg-white/10 rounded-full translate-y-6" />

                    <div className="relative z-10">
                        <p className="text-primary-100 text-sm mb-1">{greeting},</p>
                        <h1 className="text-2xl font-bold mb-1">{user?.nama?.split(' ')[0]} 👋</h1>
                        <p className="text-primary-100 text-sm mb-5">
                            Siap untuk laundry hari ini?
                        </p>

                        <button
                            onClick={() => navigate('/customer/create-order')}
                            className="flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-primary-50 transition-all shadow-md"
                        >
                            🧺 Pesan Sekarang
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Quick Stats - Link ke Orders */}
                <button
                    onClick={() => navigate('/customer/orders')}
                    className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary-500" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-gray-900">Pesanan Saya</p>
                            <p className="text-sm text-gray-500">Lihat & track status cucian</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Services Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Layanan Kami</h2>
                        <span className="text-xs text-gray-400">Harga per kg</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {services.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => navigate('/customer/create-order')}
                                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group"
                            >
                                <div className={`w-12 h-12 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-4 text-2xl shadow-md`}>
                                    {service.icon}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1 text-sm">{service.name}</h3>
                                <p className="text-xs text-gray-500 mb-3">{service.desc}</p>
                                <div>
                                    <span className={`text-lg font-bold ${service.textColor}`}>
                                        Rp {service.price.toLocaleString('id-ID')}
                                    </span>
                                    <span className="text-xs text-gray-400">/kg</span>
                                </div>
                                <div className={`mt-3 text-xs ${service.textColor} font-medium flex items-center gap-1 group-hover:gap-2 transition-all`}>
                                    Pesan Sekarang <ArrowRight className="w-3 h-3" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* How it works */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-5">Cara Kerja</h2>
                    <div className="space-y-4">
                        {[
                            { step: '1', title: 'Buat Pesanan', desc: 'Pilih layanan & metode pengantaran', icon: '📝' },
                            { step: '2', title: 'Antar atau Dijemput', desc: 'Radius 2km dari toko Holy Laundry', icon: '🚗' },
                            { step: '3', title: 'Timbang & Proses', desc: 'Ditimbang, lalu dikerjakan', icon: '⚖️' },
                            { step: '4', title: 'Ambil & Bayar', desc: 'Cucian siap, bayar sesuai berat', icon: '✅' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                                    <span className="text-white font-bold text-sm">{item.step}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                </div>
                                <span className="text-xl">{item.icon}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3">
                    {features.map((f, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
                            <div className="flex justify-center mb-2">{f.icon}</div>
                            <p className="text-xs font-medium text-gray-700">{f.text}</p>
                        </div>
                    ))}
                </div>

                {/* Info Toko */}
                <div className="bg-primary-50 border border-primary-100 rounded-3xl p-5">
                    <h3 className="font-bold text-gray-900 mb-3">📍 Lokasi Toko</h3>
                    <p className="text-sm text-gray-600 mb-1">Jl. Soka No. 12, Kapal, Mengwi, Bali</p>
                    <p className="text-sm text-gray-600 mb-3">📞 +62 878-1865-4657</p>
                    <div className="text-xs text-gray-500 space-y-1">
                        <p>⏰ <span className="font-medium">Senin - Jumat:</span> 08.00 - 18.00 WITA</p>
                        <p>⏰ <span className="font-medium">Sabtu:</span> 08.00 - 16.00 WITA</p>
                        <p>🔴 <span className="font-medium">Minggu:</span> Libur</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center py-4">
                    <p className="text-xs text-gray-400">© 2025 Holy Laundry. Made with ❤️ in Bali</p>
                </div>
            </div>
        </div>
    );
}