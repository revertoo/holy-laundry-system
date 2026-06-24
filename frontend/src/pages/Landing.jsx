import { Link } from 'react-router-dom';
import {
    ArrowRight, Sparkles, Clock, Shield,
    Star, MapPin, Phone, Mail,
    Instagram, Facebook, CheckCircle
} from 'lucide-react';

const LOGO_URL = "/images/logo-holy-laundry-no-background.png";

const services = [
    {
        id: 1,
        name: "Cuci Setrika",
        description: "Layanan lengkap mencuci hingga setrika rapi. Pakaian Anda akan bersih, wangi, dan siap pakai.",
        price: 7000,
        unit: "kg",
        image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&h=500&fit=crop",
        features: [
            "Dicuci dengan detergen premium",
            "Disetrika hingga rapi",
            "Dikemas dengan plastik bersih",
            "Estimasi 2 hari selesai"
        ]
    },
    {
        id: 2,
        name: "Setrika Saja",
        description: "Khusus untuk pakaian yang sudah bersih namun perlu disetrika agar tampil rapi.",
        price: 3000,
        unit: "kg",
        image: "https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=800&h=500&fit=crop",
        features: [
            "Disetrika dengan rapi & presisi",
            "Cocok untuk baju formal",
            "Dikemas dengan plastik bersih",
            "Estimasi 1 hari selesai"
        ]
    }
];

const howItWorks = [
    { step: 1, title: "Buat Pesanan", description: "Pilih layanan dan metode pengantaran melalui website kami" },
    { step: 2, title: "Antar atau Dijemput", description: "Antar sendiri ke toko atau kami jemput ke lokasi Anda (radius 2km)" },
    { step: 3, title: "Proses Laundry", description: "Cucian ditimbang, diproses, dan Anda akan mendapat notifikasi" },
    { step: 4, title: "Ambil & Bayar", description: "Ambil cucian yang sudah bersih dan bayar sesuai berat" }
];

const testimonials = [
    { id: 1, name: "Deta Rohila", location: "Mengwi", rating: 5, comment: "Recommended gaes, bersih, penjual ramah, hasil memuaskan.", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, name: "Rani Elok", location: "Mengwi", rating: 5, comment: "Best! Murah, bersih, wangi. Rekomen ini semeton", avatar: "https://i.pravatar.cc/150?img=2" },
    { id: 3, name: "Anom Parwata", location: "Kuta Utara", rating: 5, comment: "Layanan jemput antar sangat membantu, tidak perlu repot keluar rumah!", avatar: "https://i.pravatar.cc/150?img=3" }
];

const serviceAreas = [
    "Kapal", "Tangeb", "Lukluk", "Cica"
];

export default function Landing() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-cyan-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="inline-block px-4 py-2 bg-primary-100 rounded-full">
                                <span className="text-primary-700 text-sm font-medium">
                                    ✨ Laundry Profesional Terpercaya di Badung
                                </span>
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Bersih, Wangi,
                                <span className="text-primary-500"> dan Rapi</span>
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed">
                                Holy Laundry hadir untuk membantu kehidupan Anda lebih mudah.
                                Layanan laundry profesional dengan harga terjangkau dan hasil memuaskan.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/register">
                                    <button className="flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white text-lg font-medium rounded-2xl transition-all shadow-lg hover:shadow-xl">
                                        Mulai Sekarang
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </Link>
                                <Link to="/login">
                                    <button className="flex items-center gap-2 px-8 py-4 border-2 border-primary-500 text-primary-500 hover:bg-primary-50 text-lg font-medium rounded-2xl transition-all">
                                        Sudah punya akun? Masuk
                                    </button>
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-8 pt-4">
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">100+</p>
                                    <p className="text-sm text-gray-500">Pelanggan Puas</p>
                                </div>
                                <div className="border-l border-gray-200 pl-8">
                                    <p className="text-3xl font-bold text-gray-900">2 Km</p>
                                    <p className="text-sm text-gray-500">Area Jemput Antar</p>
                                </div>
                                <div className="border-l border-gray-200 pl-8">
                                    <p className="text-3xl font-bold text-gray-900">4.9 ⭐</p>
                                    <p className="text-sm text-gray-500">Rating Pelanggan</p>
                                </div>
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div className="relative">
                            <div className="relative z-10">
                                <img
                                    src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&h=600&fit=crop"
                                    alt="Holy Laundry Service"
                                    className="rounded-3xl shadow-2xl"
                                />
                                {/* Floating card */}
                                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-primary-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Pesanan Selesai!</p>
                                        <p className="text-xs text-gray-500">2 kg Cuci Setrika</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-primary-200 rounded-3xl -z-0 opacity-50"></div>
                            <div className="absolute -top-6 -left-6 w-48 h-48 bg-primary-100 rounded-full -z-0 opacity-70"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: <Sparkles className="w-8 h-8 text-primary-500" />, title: "Kualitas Premium", desc: "Detergen berkualitas dan peralatan modern untuk hasil maksimal" },
                            { icon: <Clock className="w-8 h-8 text-primary-500" />, title: "Tepat Waktu", desc: "Jaminan pengerjaan sesuai estimasi waktu yang dijanjikan" },
                            { icon: <Shield className="w-8 h-8 text-primary-500" />, title: "Aman & Terpercaya", desc: "Pakaian Anda ditangani dengan hati-hati dan profesional" }
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center space-y-4 border border-gray-100">
                                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="layanan" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-cyan-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <span className="inline-block px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium">
                            Layanan Kami
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                            Pilih Layanan Terbaik
                        </h2>
                        <p className="text-xl text-gray-600">
                            Sesuaikan dengan kebutuhan cucian Anda
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100"
                            >
                                <img
                                    src={service.image}
                                    alt={service.name}
                                    className="w-full h-56 object-cover"
                                />
                                <div className="p-8 space-y-4">
                                    <h3 className="text-2xl font-bold text-gray-900">{service.name}</h3>
                                    <p className="text-gray-600">{service.description}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-primary-500">
                                            Rp {service.price.toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-gray-500">/ {service.unit}</span>
                                    </div>
                                    <ul className="space-y-2">
                                        {service.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2 text-gray-700">
                                                <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link to="/register">
                                        <button className="w-full mt-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all">
                                            Pilih Layanan Ini
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="cara-kerja" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <span className="inline-block px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium">
                            Cara Kerja
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                            Mudah & Praktis
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {howItWorks.map((item, index) => (
                            <div key={item.step} className="relative text-center space-y-4">
                                <div className="relative inline-block">
                                    <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                                        <span className="text-3xl font-bold text-white">{item.step}</span>
                                    </div>
                                    {index < howItWorks.length - 1 && (
                                        <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-primary-200"></div>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                                <p className="text-gray-600 text-sm">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-cyan-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <span className="inline-block px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium">
                            Testimoni
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                            Kata Pelanggan Kami
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t) => (
                            <div key={t.id} className="bg-white rounded-2xl shadow-lg p-8 space-y-4 border border-gray-100">
                                <div className="flex gap-1">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-700 italic">"{t.comment}"</p>
                                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <p className="font-bold text-gray-900">{t.name}</p>
                                        <p className="text-sm text-gray-500">{t.location}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Service Areas */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 space-y-4">
                        <span className="inline-block px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium">
                            Area Layanan
                        </span>
                        <h2 className="text-4xl font-bold text-gray-900">
                            Kami Melayani Area
                        </h2>
                        <p className="text-gray-600">Layanan antar-jemput dalam radius 2km dari toko</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {serviceAreas.map((area, i) => (
                            <div key={i} className="flex items-center gap-2 p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors">
                                <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                <span className="font-medium text-gray-900 text-sm">{area}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-primary-600">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white">
                        Siap Menikmati Laundry Terbaik?
                    </h2>
                    <p className="text-xl text-cyan-50">
                        Daftar sekarang dan nikmati kemudahan layanan laundry profesional!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <button className="flex items-center gap-2 px-8 py-4 bg-white text-primary-500 hover:bg-gray-100 text-lg font-medium rounded-2xl transition-all">
                                Daftar Sekarang
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                        <Link to="/login">
                            <button className="flex items-center gap-2 px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-primary-500 text-lg font-medium rounded-2xl transition-all">
                                Sudah Punya Akun
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12">
                        {/* Brand */}
                        <div className="space-y-4">
                            <img
                                src={LOGO_URL}
                                alt="Holy Laundry"
                                className="h-16 w-auto brightness-0 invert"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <div className="hidden text-2xl font-bold text-white">
                                Holy <span className="text-primary-400">Laundry</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Layanan laundry profesional dengan harga terjangkau dan hasil memuaskan di Denpasar, Bali.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-bold mb-4">Navigasi</h3>
                            <ul className="space-y-2">
                                {['Beranda', 'Layanan', 'Cara Kerja', 'Masuk', 'Daftar'].map((item) => (
                                    <li key={item}>
                                        <Link
                                            to={item === 'Masuk' ? '/login' : item === 'Daftar' ? '/register' : '/'}
                                            className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                                        >
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-lg font-bold mb-4">Kontak</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-1" />
                                    <span className="text-gray-400 text-sm">Jl. Soka No. 12, Kapal, Mengwi, Bali</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-primary-400" />
                                    <span className="text-gray-400 text-sm">+62 821-4652-7698</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-primary-400" />
                                    <span className="text-gray-400 text-sm">holylaundry.bali@gmail.com</span>
                                </li>
                            </ul>
                        </div>

                        {/* Hours */}
                        <div>
                            <h3 className="text-lg font-bold mb-4">Jam Operasional</h3>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li>
                                    <span className="font-medium text-white">Senin - Jumat</span>
                                    <br />08:00 - 18:00 WITA
                                </li>
                                <li>
                                    <span className="font-medium text-white">Sabtu</span>
                                    <br />08:00 - 16:00 WITA
                                </li>
                                <li>
                                    <span className="font-medium text-white">Minggu</span>
                                    <br />Libur
                                </li>
                            </ul>
                            <div className="flex gap-3 mt-6">
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors">
                                    <Instagram className="w-4 h-4" />
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors">
                                    <Facebook className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
                        <p>© 2025 Holy Laundry. All rights reserved. Made with ❤️ in Bali</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}