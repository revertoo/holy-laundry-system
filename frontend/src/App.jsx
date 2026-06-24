import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import CustomerHome from './pages/customer/Home';
import CreateOrder from './pages/customer/CreateOrder';
import MyOrders from './pages/customer/MyOrders';
import Register from './pages/auth/Register';
import Notifications from './pages/admin/Notifications';

// Protected Route
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/login" />;
  return children;
}

function AppContent() {
  const location = useLocation();

  // Halaman yang TIDAK pakai Navbar baru
  // (karena sudah ada header sendiri di admin/customer)
  const hideNavbar = [
    '/dashboard', '/admin/', '/customer/'
  ].some(path => location.pathname.startsWith(path));

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        {/* Customer Routes */}
        <Route path="/customer/home" element={<ProtectedRoute><CustomerHome /></ProtectedRoute>} />
        <Route path="/customer/create-order" element={<ProtectedRoute><CreateOrder /></ProtectedRoute>} />
        <Route path="/customer/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return <AppContent />;
}