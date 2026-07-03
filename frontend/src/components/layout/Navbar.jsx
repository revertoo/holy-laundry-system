import { useState } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Phone, LogOut, User } from "lucide-react";

const LOGO_URL = "/images/holy-laundry-logo.png";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isLoggedIn = !!localStorage.getItem('access_token');
    const isAdmin = user?.role === 'admin';

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Nav links berdasarkan role
    const customerLinks = [
        { name: 'Beranda', path: '/customer/home' },
        { name: 'Pesan Laundry', path: '/customer/create-order' },
        { name: 'Pesanan Saya', path: '/customer/orders' },
    ];

    const adminLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Pesanan', path: '/admin/orders' },
        { name: 'Notifikasi', path: '/admin/notifications' },
    ];

    const publicLinks = [
        { name: 'Beranda', path: '/' },
        { name: 'Layanan', path: '/#layanan' },
        { name: 'Cara Kerja', path: '/#cara-kerja' },
    ];

    const navLinks = !isLoggedIn
        ? publicLinks
        : isAdmin
        ? adminLinks
        : customerLinks;

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link
                        to={isLoggedIn ? (isAdmin ? '/dashboard' : '/customer/home') : '/'}
                        className="flex items-center"
                    >
                        <img
                            src={LOGO_URL}
                            alt="Holy Laundry"
                            className="h-14 w-auto"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        {/* Fallback logo */}
                        <div
                            className="hidden items-center gap-2"
                        >
                            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                                <span className="text-white text-xl">🧺</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                Holy <span className="text-primary-500">Laundry</span>
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            link.path.startsWith('/#') ? (
                                <a
                                    key={link.path}
                                    href={link.path}
                                    className="text-sm font-medium transition-colors duration-200 text-gray-700 hover:text-primary-500"
                                >
                                    {link.name}
                                </a>
                            ) : (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`text-sm font-medium transition-colors duration-200 ${isActive(link.path)
                                        ? 'text-primary-500'
                                        : 'text-gray-700 hover:text-primary-500'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            )
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isLoggedIn ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full">
                                    <User className="w-4 h-4 text-primary-500" />
                                    <span className="text-sm font-medium text-primary-700">
                                        {user?.nama?.split(' ')[0]}
                                    </span>
                                    {isAdmin && (
                                        <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">
                                            Admin
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-gray-700 hover:text-primary-500 transition-colors"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-full transition-all shadow-md hover:shadow-lg"
                                >
                                    Daftar Sekarang
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
                    <div className="px-4 py-4 space-y-2">
                        {navLinks.map((link) => (
                            link.path.startsWith('/#') ? (
                                <a
                                    key={link.path}
                                    href={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-3 rounded-xl text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50"
                                >
                                    {link.name}
                                </a>
                            ) : (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive(link.path)
                                        ? 'bg-primary-50 text-primary-500'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            )
                        ))}

                        <div className="pt-3 border-t border-gray-100">
                            {isLoggedIn ? (
                                <div className="space-y-2">
                                    <div className="px-4 py-2 text-sm text-gray-600">
                                        👤 {user?.nama} {isAdmin && '(Admin)'}
                                    </div>
                                    <button
                                        onClick={() => { handleLogout(); setIsOpen(false); }}
                                        className="w-full px-4 py-3 text-left text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-3 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-xl text-center"
                                    >
                                        Daftar Sekarang
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}