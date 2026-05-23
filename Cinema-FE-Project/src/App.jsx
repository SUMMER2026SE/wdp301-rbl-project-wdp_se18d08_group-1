import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/landingPage/Header';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import MoviesBrowse from './pages/MoviesBrowse';
import Footer from './components/landingPage/Footer';
import MovieDetail from './pages/MovieDetail';
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';
import BookingFlow from './pages/BookingFlow';

// Manager Imports
import ManagerLayout from './components/layout/ManagerLayout';
import ManagerDashboard from './pages/manager/ManagerDashboard/ManagerDashboard';
import MovieManagementPage from './pages/manager/MovieManagementPage/MovieManagementPage';
import ShowtimeManagementPage from './pages/manager/ShowtimeManagementPage/ShowtimeManagementPage';
import HallManagementPage from './pages/manager/HallManagementPage/HallManagementPage';
import ConcessionManagementPage from './pages/manager/ConcessionManagementPage/ConcessionManagementPage';
import PricingManagementPage from './pages/manager/PricingManagementPage/PricingManagementPage';
import NewsManagementPage from './pages/manager/NewsManagementPage/NewsManagementPage';
import GenreManagementPage from './pages/manager/GenreManagementPage/GenreManagementPage';
import BannerManagementPage from './pages/manager/BannerManagementPage/BannerManagementPage';
import ReviewModerationPage from './pages/manager/ReviewModerationPage/ReviewModerationPage';

// Admin Imports
import AdminLayout from './components/layout/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard/AdminDashboard';
import UsersPage from './pages/admin/UsersPage/UsersPage';
import StaffPage from './pages/admin/StaffPage/StaffPage';
import BranchesPage from './pages/admin/BranchesPage/BranchesPage';
import VouchersPage from './pages/admin/VouchersPage/VouchersPage';
import RevenueReportsPage from './pages/admin/RevenueReportsPage/RevenueReportsPage';
import CustomerInsightsPage from './pages/admin/CustomerInsightsPage/CustomerInsightsPage';
import SettingsPage from './pages/admin/SettingsPage/SettingsPage';
import PaymentResultPage from './pages/PaymentResultPage';

import StaffDashboard from './pages/staff/StaffDashboard';
import BookingHistoryPage from './pages/customer/BookingHistoryPage/BookingHistoryPage';
import BookingDetailPage from './pages/customer/BookingDetailPage/BookingDetailPage';

// Layout cho các trang khách hàng (Home, Movie Detail...)
const CustomerLayout = () => (
  <>
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </>
);

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      {/* Giữ nguyên class của bạn để bảo toàn màu sắc gốc */}
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <Routes>

          {/* Nhóm trang Public: Sẽ có Header và Footer */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/movies" element={<MoviesBrowse />} />
            <Route path="/movies/:uuid" element={<MovieDetail />} />
            <Route path="/booking/:uuid" element={<BookingFlow />} />
            <Route path="/payment/result" element={<PaymentResultPage />} />
            <Route path="/auth/google/success" element={<GoogleAuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/booking-history" element={<BookingHistoryPage />}/>
            <Route path="/booking-history/:orderUUID" element={<BookingDetailPage />}/>
          </Route>

          {/* Trang Staff: Đứng độc lập, không dính Header/Footer khách hàng */}
          <Route
            path="/staff"
            element={
              <PrivateRoute>
                <StaffDashboard />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="branches" element={<BranchesPage />} />
            <Route path="vouchers" element={<VouchersPage />} />
            <Route path="reports" element={<RevenueReportsPage />} />
            <Route path="customers" element={<CustomerInsightsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Manager Routes */}
          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="movies" element={<MovieManagementPage />} />
            <Route path="showtimes" element={<ShowtimeManagementPage />} />
            <Route path="halls" element={<HallManagementPage />} />
            <Route path="concessions" element={<ConcessionManagementPage />} />
            <Route path="pricing" element={<PricingManagementPage />} />
            <Route path="news" element={<NewsManagementPage />} />
            <Route path="genres" element={<GenreManagementPage />} />
            <Route path="banners" element={<BannerManagementPage />} />
            <Route path="reviews" element={<ReviewModerationPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes >
      </div >
    </AuthProvider >
  );
}