"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Calendar,
  Tag,
  Users,
  Settings,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  DollarSign,
  AlertTriangle,
  Bell,
  CheckCheck,
  Trash,
  Mail,
  UserPlus,
  Clock,
} from "lucide-react";
import Link from "next/link";
import Toast from "@/components/Toast";
import Image from "next/image";
import {
  NotificationProvider,
  useNotifications,
} from "@/context/NotificationContext";
import ConfirmModal from "@/components/ConfirmModal";

// Force dynamic rendering - admin page requires authentication and DB access
export const dynamic = "force-dynamic";

type TabType =
  | "dashboard"
  | "orders"
  | "menu"
  | "reservations"
  | "coupons"
  | "customers"
  | "sms"
  | "email"
  | "staff";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  popular: boolean;
  available: boolean;
}

function AdminContent() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
    role: string;
    full_name: string;
  } | null>(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
  } = useNotifications();

  // Load thông tin user từ localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("adminUser");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setToast({ message, type });
  };

  const formatNotificationTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="min-h-screen bg-gray-100">
        {/* Top Header with Notifications */}
        <div className="fixed left-64 right-0 top-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
          <h1 className="text-xl font-bold text-hue-redDark">
            {activeTab === "dashboard" && "Dashboard"}
            {activeTab === "orders" && "Quản Lý Đơn Hàng"}
            {activeTab === "menu" && "Quản Lý Thực Đơn"}
            {activeTab === "reservations" && "Quản Lý Đặt Bàn"}
            {activeTab === "coupons" && "Quản Lý Mã Giảm Giá"}
            {activeTab === "customers" && "Quản Lý Khách Hàng"}
            {activeTab === "sms" && "Thông Báo SMS"}
            {activeTab === "email" && "Thông Báo Email"}
            {activeTab === "staff" && "Quản Lý Nhân Viên"}
          </h1>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Bell size={24} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[500px] overflow-hidden z-50">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-bold text-gray-800">Thông Báo</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-hue-red hover:text-hue-redDark flex items-center gap-1"
                    >
                      <CheckCheck size={16} />
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto max-h-[400px]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell size={48} className="mx-auto mb-2 opacity-30" />
                      <p>Không có thông báo mới</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
                          !notification.read ? "bg-blue-50" : ""
                        }`}
                        onClick={() => {
                          markAsRead(notification.id);
                          if (notification.type === "order") {
                            setActiveTab("orders");
                          } else if (notification.type === "reservation") {
                            setActiveTab("reservations");
                          }
                          setShowNotifications(false);
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {notification.type === "order" ? (
                                <ShoppingBag
                                  size={16}
                                  className="text-hue-red"
                                />
                              ) : (
                                <Calendar size={16} className="text-hue-red" />
                              )}
                              <span className="font-semibold text-sm text-gray-800">
                                {notification.message}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatNotificationTime(notification.timestamp)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        {!notification.read && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-hue-red rounded-full"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="fixed left-0 top-0 h-full w-64 bg-hue-redDark text-white p-6 overflow-y-auto z-20">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-hue-gold mb-2">
              Admin Panel
            </h2>
            <p className="text-sm text-gray-300">Bún Bò Huế Cố Đô</p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === "dashboard" ? "bg-hue-red" : "hover:bg-hue-red/50"
              }`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === "orders" ? "bg-hue-red" : "hover:bg-hue-red/50"
              }`}
            >
              <ShoppingBag size={20} />
              <span>Đơn Hàng</span>
            </button>

            <button
              onClick={() => setActiveTab("menu")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === "menu" ? "bg-hue-red" : "hover:bg-hue-red/50"
              }`}
            >
              <UtensilsCrossed size={20} />
              <span>Thực Đơn</span>
            </button>

            <button
              onClick={() => setActiveTab("reservations")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === "reservations"
                  ? "bg-hue-red"
                  : "hover:bg-hue-red/50"
              }`}
            >
              <Calendar size={20} />
              <span>Đặt Bàn</span>
            </button>

            <button
              onClick={() => setActiveTab("coupons")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === "coupons" ? "bg-hue-red" : "hover:bg-hue-red/50"
              }`}
            >
              <Tag size={20} />
              <span>Mã Giảm Giá</span>
            </button>

            <button
              onClick={() => setActiveTab("customers")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === "customers" ? "bg-hue-red" : "hover:bg-hue-red/50"
              }`}
            >
              <Users size={20} />
              <span>Khách Hàng</span>
            </button>

            <button
              onClick={() => setActiveTab("sms")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === "sms" ? "bg-hue-red" : "hover:bg-hue-red/50"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span>Thông Báo SMS</span>
            </button>

            <button
              onClick={() => setActiveTab("email")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === "email" ? "bg-hue-red" : "hover:bg-hue-red/50"
              }`}
            >
              <Mail size={20} />
              <span>Thông Báo Email</span>
            </button>

            {/* Chỉ admin mới thấy tab Quản Lý Nhân Viên */}
            {currentUser?.role === "admin" && (
              <button
                onClick={() => setActiveTab("staff")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === "staff" ? "bg-hue-red" : "hover:bg-hue-red/50"
                }`}
              >
                <UserPlus size={20} />
                <span>Quản Lý Nhân Viên</span>
              </button>
            )}
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={() => {
                localStorage.removeItem("adminToken");
                window.location.href = "/";
              }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              <LogOut size={20} />
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 pt-20 p-8">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "orders" && <OrdersTab showToast={showToast} />}
          {activeTab === "menu" && <MenuTab showToast={showToast} />}
          {activeTab === "reservations" && (
            <ReservationsTab showToast={showToast} />
          )}
          {activeTab === "coupons" && <CouponsTab showToast={showToast} />}
          {activeTab === "customers" && <CustomersTab showToast={showToast} />}
          {activeTab === "sms" && <SMSTab showToast={showToast} />}
          {activeTab === "email" && <EmailTab showToast={showToast} />}
          {activeTab === "staff" && currentUser?.role === "admin" && (
            <StaffTab showToast={showToast} />
          )}
        </div>
      </div>
    </>
  );
}

// Dashboard Tab Component
function DashboardTab() {
  const [period, setPeriod] = useState("today");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  // Auto-refresh dashboard data every 30 seconds to show latest stats
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log("🔄 Auto-refreshing dashboard data...");
      fetchDashboardData();
    }, 30000); // 30 seconds for dashboard (slower than orders)

    // Also refresh when user focuses back on the window
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("🔄 Page focused - refreshing dashboard");
        fetchDashboardData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/dashboard?period=${period}`);
      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.message || "Không thể tải dữ liệu");
      }
    } catch (err: any) {
      console.error("Dashboard error:", err);
      setError("Lỗi kết nối API");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hue-red mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ {error || "Không có dữ liệu"}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-hue-red text-white rounded-lg hover:bg-hue-redDark"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Thời gian</h3>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
          >
            <option value="today">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="year">1 năm qua</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">💰 Doanh Thu</h3>
          <p className="text-2xl font-bold text-green-600">
            {new Intl.NumberFormat("vi-VN").format(dashboardData.revenue.total)}
            đ
          </p>
          <p className="text-xs text-gray-500 mt-2">
            ✅ Từ đơn hàng "Hoàn Thành"
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <ShoppingBag className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">📦 Đơn Hàng Đã Đặt</h3>
          <p className="text-2xl font-bold text-blue-600">
            {dashboardData.orders.total}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            ✅ Số đơn hàng "Hoàn Thành"
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <Users className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">👥 Khách Hàng Đã Đặt</h3>
          <p className="text-2xl font-bold text-purple-600">
            {dashboardData.customers.total}
          </p>
          <p className="text-xs text-gray-500 mt-2">📊 Tổng số khách hàng</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-500 p-3 rounded-lg">
              <Calendar className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">🪑 Số Bàn Đã Đặt</h3>
          <p className="text-2xl font-bold text-orange-600">
            {dashboardData.reservations.completed}
          </p>
          <p className="text-xs text-gray-500 mt-2">✅ Đặt bàn "Hoàn Thành"</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📈 Doanh thu 7 ngày qua
          </h3>
          <div className="space-y-3">
            {dashboardData.revenueByDay.map((day: any, index: number) => {
              const maxRevenue = Math.max(
                ...dashboardData.revenueByDay.map((d: any) => d.revenue)
              );
              const width =
                maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;

              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      {new Date(day.date).toLocaleDateString("vi-VN", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                    <span className="font-semibold text-hue-red">
                      {new Intl.NumberFormat("vi-VN").format(day.revenue)}đ
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-hue-red to-hue-gold h-2 rounded-full transition-all duration-500"
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {day.orders} đơn hàng
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            🏆 Món bán chạy nhất
          </h3>
          <div className="space-y-4">
            {dashboardData.topItems.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-hue-red to-hue-gold rounded-full flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} phần
                    </p>
                  </div>
                </div>
                <p className="font-bold text-hue-red">
                  {new Intl.NumberFormat("vi-VN").format(item.revenue)}đ
                </p>
              </div>
            ))}
            {dashboardData.topItems.length === 0 && (
              <p className="text-center text-gray-500 py-4">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* Order Status & Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📊 Trạng thái đơn hàng
          </h3>
          <div className="space-y-3">
            {dashboardData.orders.byStatus.map((status: any, index: number) => {
              const statusLabels: any = {
                pending: { label: "Chờ xác nhận", color: "bg-yellow-500" },
                confirmed: { label: "Đã xác nhận", color: "bg-blue-500" },
                preparing: { label: "Đang chuẩn bị", color: "bg-purple-500" },
                delivering: { label: "Đang giao", color: "bg-orange-500" },
                completed: { label: "Hoàn thành", color: "bg-green-500" },
                cancelled: { label: "Đã hủy", color: "bg-red-500" },
              };
              const info = statusLabels[status.status] || {
                label: status.status,
                color: "bg-gray-500",
              };
              const percentage =
                dashboardData.orders.total > 0
                  ? (status.count / dashboardData.orders.total) * 100
                  : 0;

              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{info.label}</span>
                    <span className="font-semibold">
                      {status.count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${info.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            💳 Phương thức thanh toán
          </h3>
          <div className="space-y-3">
            {dashboardData.paymentMethods.map((pm: any, index: number) => {
              const paymentLabels: any = {
                cash: { label: "Tiền mặt", icon: "💵" },
                card: { label: "Thẻ", icon: "💳" },
                momo: { label: "MoMo", icon: "📱" },
                vnpay: { label: "VNPay", icon: "🏦" },
                bank: { label: "Chuyển khoản", icon: "🏧" },
              };
              const info = paymentLabels[pm.method] || {
                label: pm.method,
                icon: "💰",
              };
              const totalPayments = dashboardData.paymentMethods.reduce(
                (sum: number, p: any) => sum + p.count,
                0
              );
              const percentage =
                totalPayments > 0 ? (pm.count / totalPayments) * 100 : 0;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {info.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {pm.count} giao dịch
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-hue-red">
                      {new Intl.NumberFormat("vi-VN").format(pm.total)}đ
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round(percentage)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-br from-hue-red to-hue-gold rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-lg font-bold mb-4">📊 Tổng Quan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm opacity-90">Tổng đơn hàng</p>
            <p className="text-3xl font-bold">{dashboardData.orders.total}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Doanh thu</p>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("vi-VN").format(
                dashboardData.revenue.total
              )}
              đ
            </p>
          </div>
          <div>
            <p className="text-sm opacity-90">Khách hàng</p>
            <p className="text-3xl font-bold">
              {dashboardData.customers.total}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-90">Đặt bàn</p>
            <p className="text-3xl font-bold">
              {dashboardData.reservations.total}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Menu Tab Component with CRUD
function MenuTab({
  showToast,
}: {
  showToast: (msg: string, type: any) => void;
}) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "main",
    image: "",
    popular: false,
    available: true,
  });

  // Fetch menu items
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/menu");
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.data);
      }
    } catch (error) {
      showToast("Lỗi khi tải danh sách món ăn", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setImagePreview("");
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "main",
      image: "",
      popular: false,
      available: true,
    });
    setShowAddModal(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setImagePreview(item.image || "");
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      popular: item.popular,
      available: item.available,
    });
    setShowAddModal(true);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra kích thước file
    if (file.size > 5 * 1024 * 1024) {
      showToast("Kích thước file vượt quá 5MB", "error");
      return;
    }

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setImagePreview(data.data.image);
        setFormData({ ...formData, image: data.data.image });
        showToast("Tải ảnh thành công!", "success");
      } else {
        showToast(data.error || "Lỗi khi tải ảnh", "error");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showToast("Lỗi khi tải ảnh", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingItem ? `/api/menu/${editingItem.id}` : "/api/menu";
      const method = editingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showToast(
          editingItem
            ? "Cập nhật món ăn thành công!"
            : "Thêm món ăn thành công!",
          "success"
        );
        setShowAddModal(false);
        setImagePreview("");
        fetchMenuItems();
      } else {
        showToast(data.error || "Có lỗi xảy ra", "error");
      }
    } catch (error) {
      showToast("Lỗi khi lưu món ăn", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa món này?")) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        showToast("Xóa món ăn thành công!", "success");
        fetchMenuItems();
      } else {
        showToast(data.error || "Có lỗi xảy ra", "error");
      }
    } catch (error) {
      showToast("Lỗi khi xóa món ăn", "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      showToast("Vui lòng chọn ít nhất một món ăn", "warning");
      return;
    }

    if (
      !confirm(`Bạn có chắc muốn xóa ${selectedItems.size} món ăn?`)
    ) {
      return;
    }

    setBulkDeleting(true);
    try {
      const response = await fetch("/api/menu/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedItems),
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(
          `Xóa ${data.deletedCount} món ăn thành công`,
          "success"
        );
        setSelectedItems(new Set());
        fetchMenuItems();
      } else {
        showToast(data.error || "Không thể xóa", "error");
      }
    } catch (error) {
      console.error("Error bulk deleting menu items:", error);
      showToast("Lỗi khi xóa món ăn", "error");
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleItemSelection = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleAllItems = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(filteredItems.map((item) => item.id));
      setSelectedItems(allIds);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      item.category === categoryFilter ||
      (categoryFilter === "side" && item.category === "topping");
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-hue-red"></div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent bg-white"
          >
            <option value="all">Tất cả danh mục ({menuItems.length})</option>
            <option value="main">
              Món chính ({menuItems.filter((i) => i.category === "main").length}
              )
            </option>
            <option value="combo">
              Combo ({menuItems.filter((i) => i.category === "combo").length})
            </option>
            <option value="side">
              Món phụ & Topping (
              {
                menuItems.filter(
                  (i) => i.category === "side" || i.category === "topping"
                ).length
              }
              )
            </option>
            <option value="drink">
              Đồ uống ({menuItems.filter((i) => i.category === "drink").length})
            </option>
          </select>
        </div>
        <div className="flex gap-2">
          {selectedItems.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition whitespace-nowrap disabled:bg-red-300 disabled:cursor-not-allowed"
            >
              {bulkDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash size={20} />
                  Xóa ({selectedItems.size})
                </>
              )}
            </button>
          )}
          <button
            onClick={handleAdd}
            disabled={submitting}
            className="flex items-center justify-center gap-2 bg-hue-red text-white px-6 py-2 rounded-lg hover:bg-hue-redDark transition whitespace-nowrap disabled:bg-hue-redDark/50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            Thêm Món Mới
          </button>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="relative h-48">
              <Image
                src={item.image || "/images/placeholder.jpg"}
                alt={item.name}
                fill
                className="object-cover"
              />
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => toggleItemSelection(item.id)}
                className="absolute top-2 left-2 w-5 h-5 cursor-pointer z-10"
              />
              {item.popular && (
                <span className="absolute top-2 right-2 bg-hue-gold text-white px-3 py-1 rounded-full text-xs font-bold">
                  PHỔ BIẾN
                </span>
              )}
            </div>
            <div className="p-4 relative">
              {deleting === item.id && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2"></div>
                    <p className="text-white text-sm font-semibold">Đang xóa...</p>
                  </div>
                </div>
              )}
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                {item.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {item.description}
              </p>
              <div className="mb-3">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {item.category === "main" && "🍜 Món chính"}
                  {item.category === "combo" && "🎁 Combo"}
                  {(item.category === "side" || item.category === "topping") &&
                    "🥗 Món phụ"}
                  {item.category === "drink" && "🥤 Đồ uống"}
                  {item.category === "dessert" && "🍰 Tráng miệng"}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-hue-red font-bold text-xl">
                  {new Intl.NumberFormat("vi-VN").format(item.price)}đ
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.available
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.available ? "Còn hàng" : "Hết hàng"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  disabled={deleting !== null || submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  <Edit2 size={16} />
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting !== null || submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition disabled:bg-red-300 disabled:cursor-not-allowed"
                >
                  {deleting === item.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Trash2 size={16} />
                  )}
                  {deleting === item.id ? "..." : "Xóa"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <UtensilsCrossed className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">Không tìm thấy món ăn nào</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingItem ? "Sửa Món Ăn" : "Thêm Món Mới"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setImagePreview("");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên món *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mô tả *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giá (VNĐ) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Danh mục *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                    >
                      <option value="main">Món chính</option>
                      <option value="combo">Combo</option>
                      <option value="side">Món phụ & Topping</option>
                      <option value="drink">Đồ uống</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hình ảnh món *
                  </label>
                  <div className="space-y-3">
                    {/* Preview ảnh */}
                    {imagePreview && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-hue-red">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview("");
                            setFormData({ ...formData, image: "" });
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    {/* Upload file */}
                    <div>
                      <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-hue-red transition bg-gray-50">
                        <div className="text-center">
                          <Plus size={24} className="mx-auto text-gray-400 mb-1" />
                          <p className="text-sm font-medium text-gray-600">
                            {uploading ? "Đang tải..." : "Chọn hình ảnh từ máy"}
                          </p>
                          <p className="text-xs text-gray-500">
                            JPG, PNG, WebP (tối đa 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                          required={!formData.image}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.popular}
                      onChange={(e) =>
                        setFormData({ ...formData, popular: e.target.checked })
                      }
                      className="w-5 h-5 text-hue-red rounded focus:ring-hue-red"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Món phổ biến
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          available: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-hue-red rounded focus:ring-hue-red"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Còn hàng
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setImagePreview("");
                    }}
                    disabled={submitting || uploading}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="flex-1 px-6 py-3 bg-hue-red text-white rounded-lg hover:bg-hue-redDark transition font-semibold disabled:bg-hue-redDark/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Đang lưu...
                      </>
                    ) : (
                      editingItem ? "Cập Nhật" : "Thêm Món"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Orders Tab with full functionality
function OrdersTab({
  showToast,
}: {
  showToast: (msg: string, type: any) => void;
}) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<{
    id: number;
    orderNumber: string;
  } | null>(null);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [selectedOrderForSMS, setSelectedOrderForSMS] = useState<any>(null);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedOrderForEmail, setSelectedOrderForEmail] = useState<any>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    // Fetch orders on mount
    fetchOrders();

    // Auto-refresh orders every 15 seconds to catch new orders from customers
    const refreshInterval = setInterval(() => {
      fetchOrders();
    }, 15000);

    // Also refresh when user focuses back on the window
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("🔄 Page focused - refreshing orders");
        fetchOrders();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      console.log("📤 Fetching orders from /api/orders...");
      const response = await fetch("/api/orders");
      const data = await response.json();
      console.log("📥 Orders response:", data);

      if (data.success) {
        console.log(`✅ Found ${data.data.length} orders`);
        setOrders(data.data);
      } else {
        console.error("❌ Failed to fetch orders:", data.error);
      }
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      showToast("Lỗi khi tải đơn hàng", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
    showToast("Đang làm mới...", "info");
  };

  const fetchOrderDetails = async (orderId: number) => {
    setLoadingDetails(true);
    setShowDetailModal(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrderDetails(data.data);
      } else {
        showToast("Không thể tải chi tiết đơn hàng", "error");
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      showToast("Lỗi khi tải chi tiết", "error");
      setShowDetailModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const updateOrderStatus = async (
    orderId: number,
    newStatus: string,
    sendSMS: boolean = true
  ) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        showToast("Cập nhật trạng thái thành công!", "success");
        fetchOrders();

        // Tự động gửi SMS thông báo
        if (sendSMS) {
          sendOrderStatusSMS(orderId);
        }
      } else {
        showToast(data.error || "Có lỗi xảy ra", "error");
      }
    } catch (error) {
      showToast("Lỗi khi cập nhật trạng thái", "error");
    }
  };

  const sendOrderStatusSMS = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/send-sms`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        showToast("📱 Đã gửi SMS thông báo cho khách hàng", "success");
      } else {
        console.error("SMS Error:", data.error);
        // Không hiển thị lỗi SMS để không làm phiền admin
      }
    } catch (error) {
      console.error("SMS Error:", error);
    }
  };

  const openSMSModal = (order: any) => {
    setSelectedOrderForSMS(order);
    setShowSMSModal(true);
  };

  const handleSendManualSMS = async () => {
    if (!selectedOrderForSMS) return;

    setSendingSMS(true);
    await sendOrderStatusSMS(selectedOrderForSMS.id);
    setSendingSMS(false);
    setShowSMSModal(false);
    setSelectedOrderForSMS(null);
  };

  const sendOrderEmail = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/send-email`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        showToast("📧 Đã gửi email xác nhận cho khách hàng", "success");
      } else {
        showToast(data.error || "Không thể gửi email", "error");
      }
    } catch (error) {
      console.error("Email Error:", error);
      showToast("Lỗi khi gửi email", "error");
    }
  };

  const openEmailModal = (order: any) => {
    setSelectedOrderForEmail(order);
    setShowEmailModal(true);
  };

  const handleSendManualEmail = async () => {
    if (!selectedOrderForEmail) return;

    setSendingEmail(true);
    await sendOrderEmail(selectedOrderForEmail.id);
    setSendingEmail(false);
    setShowEmailModal(false);
    setSelectedOrderForEmail(null);
  };

  const confirmDelete = (orderId: number, orderNumber: string) => {
    setOrderToDelete({ id: orderId, orderNumber });
    setShowDeleteModal(true);
  };

  const deleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      const response = await fetch(`/api/orders/${orderToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        showToast("Xóa đơn hàng thành công!", "success");
        fetchOrders();
      } else {
        showToast(data.error || "Có lỗi xảy ra", "error");
      }
    } catch (error) {
      showToast("Lỗi khi xóa đơn hàng", "error");
    } finally {
      setShowDeleteModal(false);
      setOrderToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "preparing":
        return "bg-purple-100 text-purple-700";
      case "delivering":
        return "bg-orange-100 text-orange-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "preparing":
        return "Đang chuẩn bị";
      case "delivering":
        return "Đang giao";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-hue-red"></div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600">Chờ xác nhận</p>
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter((o) => o.order_status === "pending").length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600">Đang xử lý</p>
          <p className="text-2xl font-bold text-blue-600">
            {
              orders.filter(
                (o) =>
                  o.order_status === "confirmed" ||
                  o.order_status === "preparing"
              ).length
            }
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600">Đang giao</p>
          <p className="text-2xl font-bold text-orange-600">
            {orders.filter((o) => o.order_status === "delivering").length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600">Hoàn thành</p>
          <p className="text-2xl font-bold text-green-600">
            {orders.filter((o) => o.order_status === "completed").length}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Danh sách đơn hàng
          </h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-hue-red text-white rounded-lg hover:bg-hue-redDark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{refreshing ? "Đang tải..." : "Làm mới"}</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mã ĐH
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  SĐT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => fetchOrderDetails(order.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.order_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.customer_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.customer_phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-hue-red">
                      {new Intl.NumberFormat("vi-VN").format(
                        order.total_amount
                      )}
                      đ
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        order.order_status
                      )}`}
                    >
                      {getStatusText(order.order_status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={order.order_status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="preparing">Đang chuẩn bị</option>
                        <option value="delivering">Đang giao</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                      <button
                        onClick={() => openSMSModal(order)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Gửi SMS thông báo"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => openEmailModal(order)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Gửi Email xác nhận"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          confirmDelete(order.id, order.order_number)
                        }
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Xóa đơn hàng"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">Chưa có đơn hàng nào</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowDetailModal(false);
            setOrderDetails(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {loadingDetails ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hue-red mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải chi tiết...</p>
              </div>
            ) : orderDetails ? (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-hue-red to-hue-redDark text-white p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold">Chi Tiết Đơn Hàng</h2>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setOrderDetails(null);
                      }}
                      className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <p className="text-hue-gold font-semibold text-lg">
                    {orderDetails.order_number}
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Users size={20} className="text-hue-red" />
                      Thông Tin Khách Hàng
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Tên:</span>
                        <p className="font-semibold">
                          {orderDetails.customer_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">SĐT:</span>
                        <p className="font-semibold">
                          {orderDetails.customer_phone}
                        </p>
                      </div>
                      {orderDetails.customer_email && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Email:</span>
                          <p className="font-semibold">
                            {orderDetails.customer_email}
                          </p>
                        </div>
                      )}
                      {orderDetails.delivery_address && (
                        <div className="col-span-2">
                          <span className="text-gray-600">
                            Địa chỉ giao hàng:
                          </span>
                          <p className="font-semibold">
                            {orderDetails.delivery_address}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <ShoppingBag size={20} className="text-hue-red" />
                      Món Đã Đặt ({orderDetails.items?.length || 0} món)
                    </h3>
                    <div className="space-y-3">
                      {orderDetails.items?.map((item: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">
                                {item.item_name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Số lượng:{" "}
                                <span className="font-semibold">
                                  {item.quantity}
                                </span>
                              </p>
                              <p className="text-sm text-gray-600">
                                Đơn giá:{" "}
                                <span className="font-semibold text-hue-red">
                                  {new Intl.NumberFormat("vi-VN").format(
                                    item.item_price
                                  )}
                                  đ
                                </span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-hue-red text-lg">
                                {new Intl.NumberFormat("vi-VN").format(
                                  item.subtotal
                                )}
                                đ
                              </p>
                            </div>
                          </div>

                          {/* Toppings */}
                          {item.toppings && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600 mb-1">
                                Topping:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {JSON.parse(item.toppings).map(
                                  (topping: any, idx: number) => (
                                    <span
                                      key={idx}
                                      className="text-xs bg-hue-gold/20 text-hue-redDark px-2 py-1 rounded"
                                    >
                                      {topping.name}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {item.notes && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600">Ghi chú:</p>
                              <p className="text-sm text-gray-800 italic">
                                "{item.notes}"
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gradient-to-br from-hue-gold/10 to-hue-red/10 rounded-xl p-4">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <DollarSign size={20} className="text-hue-red" />
                      Tổng Kết Đơn Hàng
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tạm tính:</span>
                        <span className="font-semibold">
                          {new Intl.NumberFormat("vi-VN").format(
                            orderDetails.subtotal
                          )}
                          đ
                        </span>
                      </div>
                      {orderDetails.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Giảm giá:</span>
                          <span className="font-semibold">
                            -
                            {new Intl.NumberFormat("vi-VN").format(
                              orderDetails.discount_amount
                            )}
                            đ
                          </span>
                        </div>
                      )}
                      {orderDetails.coupon_code && (
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Mã giảm giá:</span>
                          <span className="font-semibold bg-hue-gold/20 px-2 py-0.5 rounded">
                            {orderDetails.coupon_code}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phí giao hàng:</span>
                        <span className="font-semibold">
                          {orderDetails.delivery_fee > 0
                            ? new Intl.NumberFormat("vi-VN").format(
                                orderDetails.delivery_fee
                              ) + "đ"
                            : "Miễn phí"}
                        </span>
                      </div>
                      <div className="pt-2 border-t-2 border-hue-red/30 flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800">
                          Tổng cộng:
                        </span>
                        <span className="text-2xl font-bold text-hue-red">
                          {new Intl.NumberFormat("vi-VN").format(
                            orderDetails.total_amount
                          )}
                          đ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Trạng thái:</span>
                      <p>
                        <span
                          className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                            orderDetails.order_status
                          )}`}
                        >
                          {getStatusText(orderDetails.order_status)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Thanh toán:</span>
                      <p className="font-semibold capitalize">
                        {orderDetails.payment_method}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Thời gian đặt:</span>
                      <p className="font-semibold">
                        {new Date(orderDetails.created_at).toLocaleString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    {orderDetails.updated_at && (
                      <div>
                        <span className="text-gray-600">
                          Cập nhật lần cuối:
                        </span>
                        <p className="font-semibold">
                          {new Date(orderDetails.updated_at).toLocaleString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openSMSModal(orderDetails);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      Gửi SMS
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEmailModal(orderDetails);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Gửi Email
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* SMS Confirmation Modal */}
      {showSMSModal && selectedOrderForSMS && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4"
          onClick={() => {
            setShowSMSModal(false);
            setSelectedOrderForSMS(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Gửi SMS Thông Báo
              </h3>

              {/* Message */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Gửi SMS thông báo trạng thái đơn hàng đến:
                </p>
                <p className="font-semibold text-gray-800 mb-1">
                  📱 {selectedOrderForSMS.customer_phone}
                </p>
                <p className="text-sm text-gray-600">
                  Đơn hàng:{" "}
                  <span className="font-semibold">
                    {selectedOrderForSMS.order_number}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Trạng thái:{" "}
                  <span className="font-semibold capitalize">
                    {getStatusText(selectedOrderForSMS.order_status)}
                  </span>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800">
                  ℹ️ Tin nhắn sẽ tự động được gửi khi bạn thay đổi trạng thái
                  đơn hàng. Nút này dùng để gửi lại thông báo nếu cần.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSMSModal(false);
                    setSelectedOrderForSMS(null);
                  }}
                  disabled={sendingSMS}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSendManualSMS}
                  disabled={sendingSMS}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sendingSMS ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Gửi SMS
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedOrderForEmail && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4"
          onClick={() => {
            setShowEmailModal(false);
            setSelectedOrderForEmail(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Icon */}
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Gửi Email Xác Nhận
              </h3>

              {/* Message */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Gửi email xác nhận đơn hàng đến:
                </p>
                <p className="font-semibold text-gray-800 mb-1">
                  📧 {selectedOrderForEmail.customer_email || "Chưa có email"}
                </p>
                <p className="text-sm text-gray-600">
                  Đơn hàng:{" "}
                  <span className="font-semibold">
                    {selectedOrderForEmail.order_number}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Khách hàng:{" "}
                  <span className="font-semibold">
                    {selectedOrderForEmail.customer_name}
                  </span>
                </p>
              </div>

              {!selectedOrderForEmail.customer_email ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Khách hàng chưa có email trong hệ thống. Vui lòng cập
                    nhật email để gửi thông báo.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-800">
                    ℹ️ Email bao gồm chi tiết đơn hàng, món ăn, tổng tiền và
                    thông tin liên hệ.
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setSelectedOrderForEmail(null);
                  }}
                  disabled={sendingEmail}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSendManualEmail}
                  disabled={
                    sendingEmail || !selectedOrderForEmail.customer_email
                  }
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sendingEmail ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Gửi Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setOrderToDelete(null);
        }}
        onConfirm={deleteOrder}
        title="Xác nhận xóa đơn hàng"
        message={`Bạn có chắc chắn muốn xóa đơn hàng ${orderToDelete?.orderNumber}? Hành động này không thể hoàn tác.`}
        confirmText="Xóa đơn hàng"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
}

// Reservations Tab
function ReservationsTab({
  showToast,
}: {
  showToast: (msg: string, type: any) => void;
}) {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<{
    id: number;
    customer: string;
  } | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [reservationToEmail, setReservationToEmail] = useState<{
    id: number;
    customer: string;
    email: string;
  } | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<{
    customer: string;
    note: string;
    date: string;
    time: string;
  } | null>(null);

  useEffect(() => {
    fetchReservations();
  }, [filterStatus, filterDate]);

  // Auto-refresh reservations every 15 seconds to catch new reservations from customers
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchReservations();
    }, 15000);

    // Also refresh when user focuses back on the window
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("🔄 Page focused - refreshing reservations");
        fetchReservations();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [filterStatus, filterDate]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      let url = "/api/reservations";
      const params = new URLSearchParams();

      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }
      if (filterDate) {
        params.append("date", filterDate);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setReservations(data.data || []);
      } else {
        showToast("Không thể tải danh sách đặt bàn", "error");
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
      showToast("Lỗi khi tải danh sách đặt bàn", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        showToast("Cập nhật trạng thái thành công", "success");
        fetchReservations();
      } else {
        showToast("Không thể cập nhật trạng thái", "error");
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
      showToast("Lỗi khi cập nhật trạng thái", "error");
    }
  };

  const handleDeleteClick = (reservation: any) => {
    setReservationToDelete({
      id: reservation.id,
      customer: reservation.customer_name,
    });
    setShowDeleteModal(true);
  };

  const handleEmailClick = (reservation: any) => {
    setReservationToEmail({
      id: reservation.id,
      customer: reservation.customer_name,
      email: reservation.customer_email,
    });
    setShowEmailModal(true);
  };

  const sendReservationEmail = async () => {
    if (!reservationToEmail) return;

    try {
      const response = await fetch(
        `/api/reservations/${reservationToEmail.id}/send-email`,
        { method: "POST" }
      );
      const data = await response.json();

      if (data.success) {
        showToast("Đã gửi email thành công!", "success");
      } else {
        showToast(data.error || "Không thể gửi email", "error");
      }
    } catch (error) {
      showToast("Lỗi khi gửi email", "error");
    } finally {
      setShowEmailModal(false);
      setReservationToEmail(null);
    }
  };

  const deleteReservation = async () => {
    if (!reservationToDelete) return;

    try {
      const response = await fetch(
        `/api/reservations/${reservationToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        showToast("Xóa đặt bàn thành công", "success");
        fetchReservations();
      } else {
        showToast("Không thể xóa đặt bàn", "error");
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
      showToast("Lỗi khi xóa đặt bàn", "error");
    } finally {
      setShowDeleteModal(false);
      setReservationToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hue-red mx-auto"></div>
        <p className="text-gray-600 mt-4">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setReservationToDelete(null);
        }}
        onConfirm={deleteReservation}
        title="Xác nhận xóa đặt bàn"
        message={`Bạn có chắc chắn muốn xóa đặt bàn của ${reservationToDelete?.customer}? Hành động này không thể hoàn tác.`}
        confirmText="Xóa đặt bàn"
        cancelText="Hủy"
        type="danger"
      />

      <ConfirmModal
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setReservationToEmail(null);
        }}
        onConfirm={sendReservationEmail}
        title="Xác nhận gửi email"
        message={`Bạn có chắc muốn gửi email xác nhận đặt bàn cho ${reservationToEmail?.customer} (${reservationToEmail?.email})?`}
        confirmText="Gửi email"
        cancelText="Hủy"
        type="info"
      />

      {/* Note Modal */}
      {showNoteModal && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-scaleIn">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                    <Edit2 className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Ghi Chú Đặt Bàn
                    </h3>
                    <p className="text-blue-100 text-sm mt-1">
                      {selectedNote.customer}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setSelectedNote(null);
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-blue-600" size={18} />
                    <p className="text-sm font-semibold text-blue-600">
                      Ngày đặt
                    </p>
                  </div>
                  <p className="text-lg font-bold text-blue-700">
                    {selectedNote.date}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-purple-600" size={18} />
                    <p className="text-sm font-semibold text-purple-600">
                      Giờ đặt
                    </p>
                  </div>
                  <p className="text-lg font-bold text-purple-700">
                    {selectedNote.time}
                  </p>
                </div>
              </div>

              {/* Note Content */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Yêu Cầu Đặc Biệt:
                    </p>
                    {selectedNote.note ? (
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {selectedNote.note}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic">
                        Không có ghi chú đặc biệt
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setSelectedNote(null);
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Danh Sách Đặt Bàn ({reservations.length})
          </h2>
          <button
            onClick={fetchReservations}
            className="px-4 py-2 bg-hue-red text-white rounded-lg hover:bg-hue-redDark transition"
          >
            🔄 Làm mới
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ngày đặt
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Reservations List */}
      {reservations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-gray-500 text-lg">Chưa có đặt bàn nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã ĐB
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày & Giờ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số người
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-semibold text-hue-red">
                        {reservation.reservation_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {reservation.customer_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        📱 {reservation.customer_phone}
                      </div>
                      {reservation.customer_email && (
                        <div className="text-xs text-gray-500">
                          ✉️ {reservation.customer_email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        📅{" "}
                        {new Date(
                          reservation.reservation_date
                        ).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="text-xs text-gray-500">
                        🕐 {reservation.reservation_time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        👥 {reservation.number_of_guests} người
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={reservation.status}
                        onChange={(e) =>
                          updateReservationStatus(
                            reservation.id,
                            e.target.value
                          )
                        }
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          reservation.status
                        )} border-none cursor-pointer`}
                      >
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {reservation.customer_email && (
                          <button
                            onClick={() => handleEmailClick(reservation)}
                            className="text-green-600 hover:text-green-800 transition"
                            title="Gửi email xác nhận"
                          >
                            <Mail size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedNote({
                              customer: reservation.customer_name,
                              note: reservation.special_requests || "",
                              date: new Date(
                                reservation.reservation_date
                              ).toLocaleDateString("vi-VN", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }),
                              time: reservation.reservation_time,
                            });
                            setShowNoteModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Xem ghi chú"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(reservation)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Coupons Tab
function CouponsTab({
  showToast,
}: {
  showToast: (msg: string, type: any) => void;
}) {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<{
    id: number;
    code: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: 0,
    usage_limit: 0,
    valid_until: "",
    is_active: true,
    show_in_popup: false,
    popup_priority: 999,
    popup_badge: "",
    popup_gradient: "",
    show_in_suggestions: false,
    suggestion_priority: 999,
    suggestion_badge: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/coupons?ts=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (data.success) {
        setCoupons(data.data || []);
      } else {
        showToast("Không thể tải mã giảm giá", "error");
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      showToast("Lỗi khi tải mã giảm giá", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      min_order_amount: 0,
      max_discount_amount: 0,
      usage_limit: 0,
      valid_until: "",
      is_active: true,
      show_in_popup: false,
      popup_priority: 999,
      popup_badge: "",
      popup_gradient: "",
      show_in_suggestions: false,
      suggestion_priority: 999,
      suggestion_badge: "",
    });
    setShowAddModal(true);
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: parseFloat(coupon.discount_value),
      min_order_amount: parseFloat(coupon.min_order_amount) || 0,
      max_discount_amount: parseFloat(coupon.max_discount_amount) || 0,
      usage_limit: coupon.usage_limit || 0,
      valid_until: coupon.valid_until
        ? new Date(coupon.valid_until).toISOString().split("T")[0]
        : "",
      is_active: Boolean(coupon.is_active),
      show_in_popup: Boolean(coupon.show_in_popup),
      popup_priority: coupon.popup_priority || 999,
      popup_badge: coupon.popup_badge || "",
      popup_gradient: coupon.popup_gradient || "",
      show_in_suggestions: Boolean(coupon.show_in_suggestions),
      suggestion_priority: coupon.suggestion_priority || 999,
      suggestion_badge: coupon.suggestion_badge || "",
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.code.trim()) {
      showToast("Vui lòng nhập mã giảm giá", "warning");
      setSubmitting(false);
      return;
    }

    if (formData.discount_value <= 0) {
      showToast("Giá trị giảm phải lớn hơn 0", "warning");
      setSubmitting(false);
      return;
    }

    if (
      formData.discount_type === "percentage" &&
      formData.discount_value > 100
    ) {
      showToast("Phần trăm giảm không được vượt quá 100%", "warning");
      return;
    }

    try {
      const url = editingCoupon
        ? `/api/coupons/${editingCoupon.id}`
        : "/api/coupons";
      const method = editingCoupon ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        if (data.data) {
          setCoupons((prev) => {
            const exists = prev.some((item) => item.id === data.data.id);
            if (exists) {
              return prev.map((item) =>
                item.id === data.data.id ? { ...item, ...data.data } : item
              );
            }
            return [data.data, ...prev];
          });
        }
        showToast(
          editingCoupon
            ? "Cập nhật mã giảm giá thành công"
            : "Thêm mã giảm giá thành công",
          "success"
        );
        setShowAddModal(false);
        await fetchCoupons();
      } else {
        showToast(data.error || "Có lỗi xảy ra", "error");
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
      showToast("Lỗi khi lưu mã giảm giá", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (coupon: any) => {
    setCouponToDelete({ id: coupon.id, code: coupon.code });
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;
    setDeleting(true);

    try {
      const response = await fetch(`/api/coupons/${couponToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setCoupons((prev) => prev.filter((item) => item.id !== couponToDelete.id));
        showToast("Xóa mã giảm giá thành công", "success");
        await fetchCoupons();
      } else {
        showToast("Không thể xóa mã giảm giá", "error");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      showToast("Lỗi khi xóa mã giảm giá", "error");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setCouponToDelete(null);
    }
  };

  const toggleActive = async (coupon: any) => {
    setTogglingId(coupon.id);
    try {
      const response = await fetch(`/api/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...coupon,
          is_active: !coupon.is_active,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCoupons((prev) =>
          prev.map((item) =>
            item.id === coupon.id ? { ...item, is_active: !coupon.is_active } : item
          )
        );
        showToast(
          `Đã ${coupon.is_active ? "tắt" : "bật"} mã giảm giá`,
          "success"
        );
        await fetchCoupons();
      } else {
        showToast("Không thể cập nhật trạng thái", "error");
      }
    } catch (error) {
      console.error("Error toggling coupon:", error);
      showToast("Lỗi khi cập nhật trạng thái", "error");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hue-red mx-auto"></div>
        <p className="text-gray-600 mt-4">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCouponToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Xác nhận xóa mã giảm giá"
        message={`Bạn có chắc chắn muốn xóa mã giảm giá "${couponToDelete?.code}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa mã"
        cancelText="Hủy"
        type="danger"
      />

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Mã Giảm Giá ({coupons.length})
          </h2>
          <button
            onClick={handleAdd}
            disabled={submitting}
            className="flex items-center gap-2 bg-hue-red text-white px-6 py-3 rounded-lg hover:bg-hue-redDark transition font-semibold disabled:bg-hue-redDark/50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            Thêm Mã Mới
          </button>
        </div>
      </div>

      {/* Coupons Grid */}
      {coupons.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Tag className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-gray-500 text-lg">Chưa có mã giảm giá nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => {
            const isExpired = coupon.valid_until
              ? new Date(coupon.valid_until) < new Date()
              : false;
            const isActive = coupon.is_active && !isExpired;

            return (
              <div
                key={coupon.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition ${
                  isActive ? "border-green-500" : "border-gray-200 opacity-75"
                }`}
              >
                <div
                  className={`p-4 ${
                    isActive
                      ? "bg-gradient-to-r from-hue-red to-hue-gold"
                      : "bg-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="text-white" size={24} />
                      <span className="text-white font-mono font-bold text-xl">
                        {coupon.code}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={coupon.is_active}
                        onChange={() => toggleActive(coupon)}
                        disabled={togglingId === coupon.id}
                        className="sr-only peer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 ${togglingId === coupon.id ? 'opacity-50' : ''}`}></div>
                    </label>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-gray-700 mb-3 text-sm min-h-[40px]">
                    {coupon.description || "Không có mô tả"}
                  </p>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Loại giảm:</span>
                      <span className="font-semibold text-hue-red">
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}%`
                          : `${new Intl.NumberFormat("vi-VN").format(
                              coupon.discount_value
                            )}đ`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Đơn tối thiểu:</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat("vi-VN").format(
                          coupon.min_order_amount || 0
                        )}
                        đ
                      </span>
                    </div>
                    {coupon.max_discount_amount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Giảm tối đa:</span>
                        <span className="font-semibold text-green-600">
                          {new Intl.NumberFormat("vi-VN").format(
                            coupon.max_discount_amount
                          )}
                          đ
                        </span>
                      </div>
                    )}
                    {coupon.usage_limit > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Đã dùng:</span>
                        <span className="font-semibold">
                          {coupon.used_count || 0}/{coupon.usage_limit}
                        </span>
                      </div>
                    )}
                    {coupon.valid_until && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Hết hạn:</span>
                        <span
                          className={`font-semibold ${
                            isExpired ? "text-red-600" : "text-gray-900"
                          }`}
                        >
                          {new Date(coupon.valid_until).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(coupon)}
                      disabled={submitting || deleting}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                      <Edit2 size={16} />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteClick(coupon)}
                      disabled={deleting}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition disabled:bg-red-300 disabled:cursor-not-allowed"
                    >
                      {deleting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                      {deleting ? "..." : "Xóa"}
                    </button>
                  </div>

                  {isExpired && (
                    <div className="mt-3 text-center">
                      <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
                        ⚠️ Đã hết hạn
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingCoupon ? "Sửa Mã Giảm Giá" : "Thêm Mã Giảm Giá"}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mã giảm giá *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent uppercase"
                    placeholder="EXAMPLE2024"
                    required
                    disabled={!!editingCoupon}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Chỉ chữ in hoa và số, không dấu
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                    placeholder="Giảm giá cho khách hàng mới"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loại giảm *
                    </label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_type: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                      required
                    >
                      <option value="percentage">Phần trăm (%)</option>
                      <option value="fixed">Số tiền cố định (đ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giá trị giảm *
                    </label>
                    <input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_value: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                      required
                      min="0"
                      step={
                        formData.discount_type === "percentage" ? "1" : "1000"
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Đơn hàng tối thiểu (đ)
                    </label>
                    <input
                      type="number"
                      value={formData.min_order_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          min_order_amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giảm tối đa (đ)
                    </label>
                    <input
                      type="number"
                      value={formData.max_discount_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_discount_amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giới hạn sử dụng
                    </label>
                    <input
                      type="number"
                      value={formData.usage_limit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          usage_limit: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                      min="0"
                      placeholder="0 = Không giới hạn"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày hết hạn
                    </label>
                    <input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          valid_until: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-5 h-5 text-hue-red focus:ring-hue-red border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_active"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Kích hoạt mã ngay
                  </label>
                </div>

                {/* Popup Management Section */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    🎁 Quản lý Popup Khuyến Mãi
                  </h3>

                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="show_in_popup"
                      checked={formData.show_in_popup}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          show_in_popup: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-hue-red focus:ring-hue-red border-gray-300 rounded"
                    />
                    <label
                      htmlFor="show_in_popup"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Hiển thị trong popup trang chủ
                    </label>
                  </div>

                  {formData.show_in_popup && (
                    <div className="space-y-4 pl-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Thứ tự ưu tiên
                          </label>
                          <input
                            type="number"
                            value={formData.popup_priority}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                popup_priority: parseInt(e.target.value) || 999,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                            min="1"
                            placeholder="1 = Ưu tiên cao nhất"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Số nhỏ = hiển thị trước
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nhãn giảm giá
                          </label>
                          <input
                            type="text"
                            value={formData.popup_badge}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                popup_badge: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                            placeholder="-20%, -50K"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            VD: -20%, -50K, FREE
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Màu gradient popup
                        </label>
                        <select
                          value={formData.popup_gradient}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              popup_gradient: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                        >
                          <option value="">Chọn màu gradient</option>
                          <option value="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                            💜 Purple Dream
                          </option>
                          <option value="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                            🌸 Pink Passion
                          </option>
                          <option value="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
                            💙 Ocean Blue
                          </option>
                          <option value="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
                            💚 Fresh Mint
                          </option>
                          <option value="linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
                            🌅 Sunset Glow
                          </option>
                          <option value="linear-gradient(135deg, #30cfd0 0%, #330867 100%)">
                            🌊 Deep Ocean
                          </option>
                          <option value="linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)">
                            🔥 Fire Coral
                          </option>
                          <option value="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)">
                            🍡 Cotton Candy
                          </option>
                        </select>
                        {formData.popup_gradient && (
                          <div
                            className="mt-2 h-12 rounded-lg"
                            style={{ background: formData.popup_gradient }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestion Management Section */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    💡 Quản lý Gợi Ý Thanh Toán
                  </h3>

                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="show_in_suggestions"
                      checked={formData.show_in_suggestions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          show_in_suggestions: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-hue-red focus:ring-hue-red border-gray-300 rounded"
                    />
                    <label
                      htmlFor="show_in_suggestions"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Hiển thị trong gợi ý trang thanh toán
                    </label>
                  </div>

                  {formData.show_in_suggestions && (
                    <div className="space-y-4 pl-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Thứ tự ưu tiên
                          </label>
                          <input
                            type="number"
                            value={formData.suggestion_priority}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                suggestion_priority:
                                  parseInt(e.target.value) || 999,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                            min="1"
                            placeholder="1 = Ưu tiên cao nhất"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Số nhỏ = hiển thị trước
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nhãn hiển thị
                          </label>
                          <input
                            type="text"
                            value={formData.suggestion_badge}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                suggestion_badge: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                            placeholder="-20%, -50K, FREE"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Tự động nếu để trống
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-hue-red text-white rounded-lg hover:bg-hue-redDark transition font-semibold disabled:bg-hue-redDark/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Đang lưu...
                      </>
                    ) : (
                      editingCoupon ? "Cập Nhật" : "Thêm Mới"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Customers Tab
function CustomersTab({
  showToast,
}: {
  showToast: (msg: string, type: any) => void;
}) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [customerDetail, setCustomerDetail] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCustomers();
  }, [filterType, searchQuery]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filterType !== "all") params.append("type", filterType);

      const response = await fetch(`/api/customers?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setCustomers(data.data || []);
        setStats(data.stats);
      } else {
        showToast("Không thể tải danh sách khách hàng", "error");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      showToast("Lỗi khi tải danh sách khách hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  const viewCustomerDetail = async (customer: any) => {
    try {
      setSelectedCustomer(customer);
      setShowDetailModal(true);

      const response = await fetch(`/api/customers/${customer.phone}`);
      const data = await response.json();

      if (data.success) {
        setCustomerDetail(data.data);
      } else {
        showToast("Không thể tải chi tiết khách hàng", "error");
      }
    } catch (error) {
      console.error("Error fetching customer detail:", error);
      showToast("Lỗi khi tải chi tiết khách hàng", "error");
    }
  };

  const handleEditClick = (customer: any) => {
    setEditingCustomer(customer);
    setEditFormData({
      name: customer.name || "",
      email: customer.email || "",
      address: customer.address || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCustomer) return;

    try {
      const response = await fetch(
        `/api/customers/${editingCustomer.phone}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editFormData),
        }
      );

      const data = await response.json();

      if (data.success) {
        showToast("Cập nhật thông tin khách hàng thành công", "success");
        setShowEditModal(false);
        setEditingCustomer(null);
        fetchCustomers();
      } else {
        showToast(data.error || "Không thể cập nhật", "error");
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      showToast("Lỗi khi cập nhật khách hàng", "error");
    }
  };

  const handleDeleteClick = (customer: any) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const deleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      const response = await fetch(
        `/api/customers/${customerToDelete.phone}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (data.success) {
        showToast("Xóa khách hàng thành công", "success");
        fetchCustomers();
      } else {
        showToast(data.error || "Không thể xóa", "error");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      showToast("Lỗi khi xóa khách hàng", "error");
    } finally {
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.size === 0) {
      showToast("Vui lòng chọn ít nhất một khách hàng", "warning");
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa ${selectedCustomers.size} khách hàng?`)) {
      return;
    }

    try {
      const response = await fetch("/api/customers/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phones: Array.from(selectedCustomers),
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(
          `Xóa ${data.deleted.customers} khách hàng thành công`,
          "success"
        );
        setSelectedCustomers(new Set());
        fetchCustomers();
      } else {
        showToast(data.error || "Không thể xóa", "error");
      }
    } catch (error) {
      console.error("Error bulk deleting customers:", error);
      showToast("Lỗi khi xóa khách hàng", "error");
    }
  };

  const toggleCustomerSelection = (phone: string) => {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(phone)) {
      newSelected.delete(phone);
    } else {
      newSelected.add(phone);
    }
    setSelectedCustomers(newSelected);
  };

  const toggleAllCustomers = () => {
    if (selectedCustomers.size === customers.length) {
      setSelectedCustomers(new Set());
    } else {
      const allPhones = new Set(customers.map((c) => c.phone));
      setSelectedCustomers(allPhones);
    }
  };

  const getCustomerType = (customer: any) => {
    const totalSpent = customer?.total_spent || 0;
    const totalOrders = customer?.total_orders || 0;

    if (totalSpent >= 1000000 || totalOrders >= 5) {
      return {
        label: "VIP",
        color: "text-purple-700",
        icon: "👑",
      };
    } else if (totalOrders >= 2) {
      return {
        label: "Khách quen",
        color: "text-blue-700",
        icon: "⭐",
      };
    } else {
      return {
        label: "Khách mới",
        color: "text-green-700",
        icon: "🆕",
      };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hue-red mx-auto"></div>
        <p className="text-gray-600 mt-4">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">Tổng khách hàng</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">Khách mới</p>
            <p className="text-2xl font-bold text-green-600">{stats.new}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">Khách quen</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.returning}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">Khách VIP</p>
            <p className="text-2xl font-bold text-purple-600">{stats.vip}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-hue-red">
              {new Intl.NumberFormat("vi-VN").format(stats.totalRevenue)}đ
            </p>
          </div>
        </div>
      )}

      {/* Header & Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Danh Sách Khách Hàng ({customers.length})
          </h2>
          {selectedCustomers.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              <Trash size={18} />
              Xóa ({selectedCustomers.size})
            </button>
          )}
        </div>

        {/* Search & Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
            >
              <option value="all">Tất cả khách hàng</option>
              <option value="new">Khách mới</option>
              <option value="returning">Khách quen</option>
              <option value="vip">Khách VIP</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      {customers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-gray-500 text-lg">Chưa có khách hàng nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.size === customers.length && customers.length > 0}
                      onChange={toggleAllCustomers}
                      className="rounded cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đặt bàn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng chi tiêu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phân loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lần cuối
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer, index) => {
                  const customerType = getCustomerType(customer);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.has(customer.phone)}
                          onChange={() => toggleCustomerSelection(customer.phone)}
                          className="rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-hue-red to-hue-gold rounded-full flex items-center justify-center text-white font-bold">
                            {customer.name?.charAt(0) || "?"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {customer.name || "Chưa có tên"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          📱 {customer.phone}
                        </div>
                        {customer.email && (
                          <div className="text-xs text-gray-500">
                            ✉️ {customer.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {customer.total_orders} đơn
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {customer.total_reservations} lần
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-hue-red">
                          {new Intl.NumberFormat("vi-VN").format(
                            customer.total_spent
                          )}
                          đ
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${customerType.color}`}
                        >
                          {customerType.icon} {customerType.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.last_visit).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-y-1">
                        <button
                          onClick={() => viewCustomerDetail(customer)}
                          className="block text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Xem chi tiết
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(customer)}
                            className="text-green-600 hover:text-green-800 transition text-xs"
                            title="Sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(customer)}
                            className="text-red-600 hover:text-red-800 transition text-xs"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => {
            setShowDetailModal(false);
            setSelectedCustomer(null);
            setCustomerDetail(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-hue-red to-hue-gold p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-white/30 shadow-lg">
                    {selectedCustomer.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-3xl font-bold">
                        {selectedCustomer?.name || "Khách hàng"}
                      </h2>
                      {(() => {
                        const customerType = getCustomerType(selectedCustomer);
                        return (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${customerType.color} bg-white`}
                          >
                            {customerType.icon} {customerType.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-4 text-white/90">
                      <p className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        {selectedCustomer?.phone || "N/A"}
                      </p>
                      {selectedCustomer?.email && (
                        <p className="flex items-center gap-1">
                          <Mail size={16} />
                          {selectedCustomer.email}
                        </p>
                      )}
                    </div>
                    {selectedCustomer?.address && (
                      <p className="text-sm text-white/80 mt-1 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          />
                        </svg>
                        {selectedCustomer.address}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedCustomer(null);
                    setCustomerDetail(null);
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition"
                >
                  <X size={28} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200 hover:shadow-lg transition">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-blue-600">
                      Tổng đơn hàng
                    </p>
                    <ShoppingBag className="text-blue-500" size={24} />
                  </div>
                  <p className="text-3xl font-bold text-blue-700">
                    {selectedCustomer?.total_orders || 0}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">đơn</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-2 border-green-200 hover:shadow-lg transition">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-green-600">
                      Đặt bàn
                    </p>
                    <Calendar className="text-green-500" size={24} />
                  </div>
                  <p className="text-3xl font-bold text-green-700">
                    {selectedCustomer?.total_reservations || 0}
                  </p>
                  <p className="text-xs text-green-600 mt-1">lần</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border-2 border-purple-200 hover:shadow-lg transition">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-purple-600">
                      Tổng chi tiêu
                    </p>
                    <DollarSign className="text-purple-500" size={24} />
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    {new Intl.NumberFormat("vi-VN", {
                      notation:
                        (selectedCustomer?.total_spent || 0) >= 1000000
                          ? "compact"
                          : "standard",
                      compactDisplay: "short",
                    }).format(selectedCustomer?.total_spent || 0)}
                    đ
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    ≈{" "}
                    {new Intl.NumberFormat("vi-VN").format(
                      Math.round(
                        (selectedCustomer?.total_spent || 0) /
                          (selectedCustomer?.total_orders || 1)
                      )
                    )}
                    đ/đơn
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border-2 border-orange-200 hover:shadow-lg transition">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-orange-600">
                      Điểm thưởng
                    </p>
                    <svg
                      className="w-6 h-6 text-orange-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-orange-700">
                    {selectedCustomer?.loyalty_points || 0}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Từ{" "}
                    {new Date(
                      selectedCustomer?.first_visit ||
                        selectedCustomer?.created_at ||
                        new Date()
                    ).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>

              {customerDetail ? (
                <div className="space-y-6">
                  {/* Favorite Items */}
                  {customerDetail.favoriteItems &&
                    customerDetail.favoriteItems.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <svg
                            className="w-6 h-6 text-hue-red"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Món ăn yêu thích
                          <span className="text-sm font-normal text-gray-500">
                            ({customerDetail.favoriteItems.length})
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {customerDetail.favoriteItems.map(
                            (item: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border-2 border-orange-200 hover:border-hue-red hover:shadow-lg transition-all duration-200"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-bold text-gray-800 text-lg mb-1">
                                      {item.item_name}
                                    </p>
                                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                      <span className="bg-white px-2 py-1 rounded-md font-medium">
                                        🔢 {item.order_count} lần
                                      </span>
                                      <span className="bg-white px-2 py-1 rounded-md font-medium">
                                        🍽️ {item.total_quantity} phần
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right ml-3">
                                    <p className="text-xl font-bold text-hue-red">
                                      {new Intl.NumberFormat("vi-VN").format(
                                        item.total_spent
                                      )}
                                      đ
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Tổng chi
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Order History */}
                  {customerDetail.orders &&
                    customerDetail.orders.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingBag className="text-hue-red" size={24} />
                            Lịch sử đơn hàng
                            <span className="text-sm font-normal text-gray-500">
                              ({customerDetail.orders.length})
                            </span>
                          </h3>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                          {customerDetail.orders.map((order: any) => {
                            const getStatusConfig = (status: string) => {
                              const configs: {
                                [key: string]: {
                                  bg: string;
                                  text: string;
                                  label: string;
                                  icon: string;
                                };
                              } = {
                                completed: {
                                  bg: "bg-green-100",
                                  text: "text-green-700",
                                  label: "Hoàn thành",
                                  icon: "✓",
                                },
                                pending: {
                                  bg: "bg-yellow-100",
                                  text: "text-yellow-700",
                                  label: "Chờ xử lý",
                                  icon: "⏳",
                                },
                                cancelled: {
                                  bg: "bg-red-100",
                                  text: "text-red-700",
                                  label: "Đã hủy",
                                  icon: "✕",
                                },
                                delivering: {
                                  bg: "bg-blue-100",
                                  text: "text-blue-700",
                                  label: "Đang giao",
                                  icon: "🚚",
                                },
                                confirmed: {
                                  bg: "bg-cyan-100",
                                  text: "text-cyan-700",
                                  label: "Đã xác nhận",
                                  icon: "📋",
                                },
                              };
                              return (
                                configs[status] || {
                                  bg: "bg-gray-100",
                                  text: "text-gray-700",
                                  label: status,
                                  icon: "•",
                                }
                              );
                            };

                            const statusConfig = getStatusConfig(
                              order.order_status
                            );

                            return (
                              <div
                                key={order.id}
                                className="bg-white border-2 border-gray-100 p-4 rounded-xl hover:border-hue-red hover:shadow-lg transition-all duration-200"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-bold text-gray-800 text-lg">
                                        {order.order_number}
                                      </p>
                                      <span
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                                      >
                                        <span>{statusConfig.icon}</span>
                                        {statusConfig.label}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                      <Calendar size={14} />
                                      {new Date(
                                        order.created_at
                                      ).toLocaleString("vi-VN", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                  <div className="text-right ml-3">
                                    <p className="text-xl font-bold text-hue-red">
                                      {new Intl.NumberFormat("vi-VN").format(
                                        order.total_amount
                                      )}
                                      đ
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* Reservation History */}
                  {customerDetail.reservations &&
                    customerDetail.reservations.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <svg
                              className="w-6 h-6 text-hue-red"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                            </svg>
                            Lịch sử đặt bàn
                            <span className="text-sm font-normal text-gray-500">
                              ({customerDetail.reservations.length})
                            </span>
                          </h3>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                          {customerDetail.reservations.map(
                            (reservation: any) => {
                              const getReservationStatusConfig = (
                                status: string
                              ) => {
                                const configs: {
                                  [key: string]: {
                                    bg: string;
                                    text: string;
                                    label: string;
                                    icon: string;
                                  };
                                } = {
                                  completed: {
                                    bg: "bg-green-100",
                                    text: "text-green-700",
                                    label: "Hoàn thành",
                                    icon: "✓",
                                  },
                                  confirmed: {
                                    bg: "bg-blue-100",
                                    text: "text-blue-700",
                                    label: "Đã xác nhận",
                                    icon: "📋",
                                  },
                                  pending: {
                                    bg: "bg-yellow-100",
                                    text: "text-yellow-700",
                                    label: "Chờ xác nhận",
                                    icon: "⏳",
                                  },
                                  cancelled: {
                                    bg: "bg-red-100",
                                    text: "text-red-700",
                                    label: "Đã hủy",
                                    icon: "✕",
                                  },
                                };
                                return (
                                  configs[status] || {
                                    bg: "bg-gray-100",
                                    text: "text-gray-700",
                                    label: status,
                                    icon: "•",
                                  }
                                );
                              };

                              const statusConfig = getReservationStatusConfig(
                                reservation.status
                              );

                              return (
                                <div
                                  key={reservation.id}
                                  className="bg-white border-2 border-gray-100 p-4 rounded-xl hover:border-hue-red hover:shadow-lg transition-all duration-200"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <p className="font-bold text-gray-800 text-lg">
                                          {reservation.reservation_number}
                                        </p>
                                        <span
                                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                                        >
                                          <span>{statusConfig.icon}</span>
                                          {statusConfig.label}
                                        </span>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm text-gray-600 flex items-center gap-2">
                                          <Calendar
                                            size={16}
                                            className="text-hue-red"
                                          />
                                          {new Date(
                                            reservation.reservation_date
                                          ).toLocaleDateString("vi-VN", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                          })}
                                        </p>
                                        <p className="text-sm text-gray-600 flex items-center gap-2">
                                          <Clock
                                            size={16}
                                            className="text-hue-red"
                                          />
                                          {reservation.reservation_time}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right ml-3">
                                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-2 rounded-lg border-2 border-blue-200">
                                        <p className="text-xs text-blue-600 mb-1">
                                          Số khách
                                        </p>
                                        <p className="text-2xl font-bold text-blue-700 flex items-center gap-1">
                                          <Users size={20} />
                                          {reservation.number_of_guests}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hue-red mx-auto"></div>
                  <p className="text-gray-600 mt-4">Đang tải chi tiết...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Sửa Thông Tin Khách Hàng
              </h3>
            </div>

            <form onSubmit={handleUpdateCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khách hàng
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      address: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCustomer(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-hue-red text-white rounded-lg hover:bg-hue-redDark transition"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Customer Modal */}
      {showDeleteModal && customerToDelete && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCustomerToDelete(null);
          }}
          onConfirm={deleteCustomer}
          title="Xác nhận xóa khách hàng"
          message={`Bạn có chắc muốn xóa khách hàng ${customerToDelete.name}? Tất cả đơn hàng và đặt bàn sẽ bị xóa.`}
          confirmText="Xóa"
          cancelText="Hủy"
          type="danger"
        />
      )}
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  // Kiểm tra token khi load trang
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setToast({ message, type });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginForm.username || !loginForm.password) {
      showToast("Vui lòng nhập đầy đủ thông tin", "warning");
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Lưu token và thông tin user
        localStorage.setItem("adminToken", data.data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.data.user));

        setIsAuthenticated(true);
        showToast("Đăng nhập thành công!", "success");
      } else {
        showToast(data.error || "Đăng nhập thất bại", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("Lỗi kết nối đến server", "error");
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <div className="min-h-screen bg-gradient-to-br from-hue-red to-hue-redDark flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-hue-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings size={40} className="text-hue-redDark" />
              </div>
              <h1 className="font-display text-3xl font-bold text-hue-redDark mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Đăng nhập để tiếp tục</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, username: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                  placeholder="admin"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                  placeholder="Admin@12345"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-hue-red text-white py-3 rounded-lg font-bold hover:bg-hue-redDark transition"
              >
                Đăng Nhập
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <NotificationProvider>
      <AdminContent />
    </NotificationProvider>
  );
}

// SMS Tab Component
function SMSTab({
  showToast,
}: {
  showToast: (msg: string, type: any) => void;
}) {
  const [smsLogs, setSmsLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [smsToDelete, setSmsToDelete] = useState<{
    id: number;
    phone: string;
  } | null>(null);

  useEffect(() => {
    fetchSMSLogs();
  }, []);

  const fetchSMSLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sms-logs");
      const data = await response.json();

      if (data.success) {
        setSmsLogs(data.data || []);
        setStats(
          data.stats || {
            total: 0,
            sent: 0,
            failed: 0,
            pending: 0,
          }
        );
      } else {
        console.error("Failed to fetch SMS logs:", data.error);
        showToast("Lỗi khi tải lịch sử SMS", "error");
      }
    } catch (error) {
      console.error("Error fetching SMS logs:", error);
      showToast("Lỗi khi tải lịch sử SMS", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (log: any) => {
    setSmsToDelete({ id: log.id, phone: log.phone_number });
    setShowDeleteModal(true);
  };

  const deleteSMS = async () => {
    if (!smsToDelete) return;

    try {
      const response = await fetch(`/api/sms-logs/${smsToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        showToast("Đã xóa log SMS", "success");
        fetchSMSLogs();
      } else {
        showToast(data.error || "Không thể xóa log SMS", "error");
      }
    } catch (error) {
      console.error("Error deleting SMS log:", error);
      showToast("Lỗi khi xóa log SMS", "error");
    } finally {
      setShowDeleteModal(false);
      setSmsToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hue-red mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteSMS}
        title="Xác nhận xóa log SMS"
        message={`Bạn có chắc muốn xóa log SMS gửi đến ${smsToDelete?.phone}?`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Tổng SMS</p>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Đã gửi</p>
          <p className="text-3xl font-bold text-green-600">{stats.sent}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-600 mb-1">Thất bại</p>
          <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 mb-1">Đang chờ</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
      </div>

      {/* SMS History Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Lịch Sử Gửi SMS
          </h2>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mã ĐH
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {smsLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {log.order_number || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      📱 {log.phone_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {log.message_type === "order_status"
                        ? "Trạng thái đơn"
                        : log.message_type === "order_confirmation"
                        ? "Xác nhận đơn"
                        : log.message_type === "reservation"
                        ? "Đặt bàn"
                        : log.message_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.status === "sent"
                          ? "bg-green-100 text-green-700"
                          : log.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {log.status === "sent"
                        ? "Đã gửi"
                        : log.status === "failed"
                        ? "Thất bại"
                        : "Đang chờ"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.sent_at).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteClick(log)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Xóa log"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {smsLogs.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="text-gray-500">Chưa có lịch sử gửi SMS</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Email Tab Component
function EmailTab({
  showToast,
}: {
  showToast: (msg: string, type: any) => void;
}) {
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailType, setEmailType] = useState<"all" | "orders" | "reservations">(
    "all"
  );
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState<{
    id: number;
    email: string;
  } | null>(null);

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  const filteredEmailLogs = emailLogs.filter((log) => {
    if (emailType === "all") return true;
    if (emailType === "orders") return log.order_id !== null;
    if (emailType === "reservations") return log.reservation_id !== null;
    return true;
  });

  const fetchEmailLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/email-logs");
      const data = await response.json();

      if (data.success) {
        setEmailLogs(data.data || []);
        setStats(
          data.stats || {
            total: 0,
            sent: 0,
            failed: 0,
            pending: 0,
          }
        );
      } else {
        console.error("Failed to fetch email logs:", data.error);
        showToast("Lỗi khi tải lịch sử email", "error");
      }
    } catch (error) {
      console.error("Error fetching email logs:", error);
      showToast("Lỗi khi tải lịch sử email", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (log: any) => {
    setEmailToDelete({ id: log.id, email: log.recipient_email });
    setShowDeleteModal(true);
  };

  const deleteEmail = async () => {
    if (!emailToDelete) return;

    try {
      const response = await fetch(`/api/email-logs/${emailToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        showToast("Đã xóa log email", "success");
        fetchEmailLogs();
      } else {
        showToast(data.error || "Không thể xóa log email", "error");
      }
    } catch (error) {
      console.error("Error deleting email log:", error);
      showToast("Lỗi khi xóa log email", "error");
    } finally {
      setShowDeleteModal(false);
      setEmailToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hue-red mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteEmail}
        title="Xác nhận xóa log email"
        message={`Bạn có chắc muốn xóa log email gửi đến ${emailToDelete?.email}?`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Tổng Email</p>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Đã gửi</p>
          <p className="text-3xl font-bold text-green-600">{stats.sent}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-600 mb-1">Thất bại</p>
          <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 mb-1">Đang chờ</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
      </div>

      {/* Email History Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Lịch Sử Gửi Email
            </h2>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setEmailType("all")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  emailType === "all"
                    ? "bg-hue-red text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                📧 Tất cả ({emailLogs.length})
              </button>
              <button
                onClick={() => setEmailType("orders")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  emailType === "orders"
                    ? "bg-hue-red text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                📦 Đơn hàng (
                {emailLogs.filter((log) => log.order_id !== null).length})
              </button>
              <button
                onClick={() => setEmailType("reservations")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  emailType === "reservations"
                    ? "bg-hue-red text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🍽️ Đặt bàn (
                {emailLogs.filter((log) => log.reservation_id !== null).length})
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mã ĐH
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmailLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {log.order_number || log.reservation_number || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-gray-900">
                        {log.recipient_email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
                      {log.message_type === "order_status"
                        ? "📦 Trạng thái đơn"
                        : log.message_type === "order_confirmation"
                        ? "✅ Xác nhận đơn"
                        : log.message_type === "reservation"
                        ? "🍽️ Đặt bàn"
                        : log.message_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.status === "sent"
                          ? "bg-green-100 text-green-700"
                          : log.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {log.status === "sent"
                        ? "Đã gửi"
                        : log.status === "failed"
                        ? "Thất bại"
                        : "Đang chờ"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.sent_at).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteClick(log)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Xóa log"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmailLogs.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {emailType === "all"
                ? "Chưa có lịch sử gửi email"
                : emailType === "orders"
                ? "Chưa có email đơn hàng"
                : "Chưa có email đặt bàn"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Staff Management Tab Component
function StaffTab({
  showToast,
}: {
  showToast: (msg: string, type: any) => void;
}) {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [staffToDelete, setStaffToDelete] = useState<{
    id: number;
    username: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "staff",
  });
  const [editFormData, setEditFormData] = useState({
    role: "staff",
    full_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/staff");
      const data = await response.json();

      if (data.success) {
        setStaff(data.data || []);
      } else {
        showToast("Lỗi khi tải danh sách nhân viên", "error");
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      showToast("Lỗi khi tải danh sách nhân viên", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      showToast("Vui lòng điền đầy đủ thông tin", "warning");
      return;
    }

    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showToast("Thêm nhân viên thành công", "success");
        setShowAddModal(false);
        setFormData({ username: "", password: "", role: "staff" });
        fetchStaff();
      } else {
        showToast(data.error || "Không thể thêm nhân viên", "error");
      }
    } catch (error) {
      console.error("Error adding staff:", error);
      showToast("Lỗi khi thêm nhân viên", "error");
    }
  };

  const handleDeleteClick = (member: any) => {
    setStaffToDelete({ id: member.id, username: member.username });
    setShowDeleteModal(true);
  };

  const handleEditClick = (member: any) => {
    setEditingStaff(member);
    setEditFormData({
      role: member.role || "staff",
      full_name: member.full_name || "",
      email: member.email || "",
      phone: member.phone || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingStaff) return;

    try {
      const response = await fetch(`/api/staff/${editingStaff.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (data.success) {
        showToast("Cập nhật nhân viên thành công", "success");
        setShowEditModal(false);
        setEditingStaff(null);
        fetchStaff();
      } else {
        showToast(data.error || "Không thể cập nhật nhân viên", "error");
      }
    } catch (error) {
      console.error("Error updating staff:", error);
      showToast("Lỗi khi cập nhật nhân viên", "error");
    }
  };

  const deleteStaff = async () => {
    if (!staffToDelete) return;

    try {
      const response = await fetch(`/api/staff/${staffToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        showToast("Đã xóa nhân viên", "success");
        fetchStaff();
      } else {
        showToast(data.error || "Không thể xóa nhân viên", "error");
      }
    } catch (error) {
      console.error("Error deleting staff:", error);
      showToast("Lỗi khi xóa nhân viên", "error");
    } finally {
      setShowDeleteModal(false);
      setStaffToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hue-red mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteStaff}
        title="Xác nhận xóa nhân viên"
        message={`Bạn có chắc muốn xóa nhân viên ${staffToDelete?.username}?`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />

      {/* Add Staff Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản Lý Nhân Viên</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-hue-red text-white px-4 py-2 rounded-lg hover:bg-hue-redDark transition"
        >
          <Plus size={20} />
          Thêm Nhân Viên
        </button>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tên đăng nhập
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {member.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {member.role === "admin" ? "Quản trị viên" : "Nhân viên"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.role !== "admin" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(member)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Sửa nhân viên"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(member)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Xóa nhân viên"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {staff.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Chưa có nhân viên</p>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Thêm Nhân Viên Mới
              </h3>
            </div>

            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vai trò
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                >
                  <option value="staff">Nhân viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ username: "", password: "", role: "staff" });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-hue-red text-white rounded-lg hover:bg-hue-redDark transition"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && editingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Sửa Thông Tin Nhân Viên
              </h3>
            </div>

            <form onSubmit={handleUpdateStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={editingStaff.username}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên
                </label>
                <input
                  type="text"
                  value={editFormData.full_name}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      full_name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vai trò
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hue-red focus:border-transparent"
                >
                  <option value="staff">Nhân viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStaff(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
