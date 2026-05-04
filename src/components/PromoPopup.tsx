"use client";

import { useState, useEffect } from "react";
import { X, Tag } from "lucide-react";
import Toast from "./Toast";

interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  popup_badge: string;
  popup_gradient: string;
  popup_priority: number;
}

export default function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  useEffect(() => {
    // Fetch coupons from API
    const fetchCoupons = async () => {
      try {
        const response = await fetch("/api/coupons/popup", {
          cache: "no-store",
        });
        const data = await response.json();
        if (data.success) {
          setCoupons(data.data);
        }
      } catch (error) {
        console.error("Error fetching popup coupons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();

    // Show popup after 2 seconds
    const timer = setTimeout(() => {
      const hasSeenPopup = sessionStorage.getItem("promoPopupSeen");
      if (!hasSeenPopup) {
        setIsOpen(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("promoPopupSeen", "true");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setToast({ message: `Đã sao chép mã: ${code}`, type: "success" });
    handleClose();
  };

  const formatDescription = (coupon: Coupon) => {
    if (coupon.discount_type === "percentage") {
      return `Giảm ${coupon.discount_value}% cho đơn từ ${(
        coupon.min_order_amount / 1000
      ).toFixed(0)}K`;
    } else {
      return `Giảm ${(coupon.discount_value / 1000).toFixed(0)}K cho đơn từ ${(
        coupon.min_order_amount / 1000
      ).toFixed(0)}K`;
    }
  };

  if (!isOpen || loading || coupons.length === 0) return null;

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl transform animate-scaleIn">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-hue-red transition z-10"
          >
            <X size={28} />
          </button>

          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-hue-red to-hue-redDark text-white p-8 rounded-t-3xl text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 20l-1.5-4-1.5 4-4 1.5 4 1.5 1.5 4 1.5-4 4-1.5-4-1.5zm20 20l-2-5-2 5-5 2 5 2 2 5 2-5 5-2-5-2zm-20 20l-1.5-4-1.5 4-4 1.5 4 1.5 1.5 4 1.5-4 4-1.5-4-1.5zm40-20l-2-5-2 5-5 2 5 2 2 5 2-5 5-2-5-2zm-20-20l-1.5-4-1.5 4-4 1.5 4 1.5 1.5 4 1.5-4 4-1.5-4-1.5zm20 40l-1.5-4-1.5 4-4 1.5 4 1.5 1.5 4 1.5-4 4-1.5-4-1.5z'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
              ></div>
            </div>
            <div className="relative z-10">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="font-display text-3xl font-bold mb-2">
                Chào Mừng!
              </h2>
              <p className="text-hue-cream">Ưu đãi đặc biệt dành cho bạn</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-5">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="relative overflow-hidden rounded-2xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
                style={{
                  background:
                    coupon.popup_gradient ||
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
                onClick={() => handleCopyCode(coupon.code)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                        <Tag size={20} className="text-white" />
                      </div>
                      <span className="font-bold text-xl text-white">
                        {coupon.code}
                      </span>
                    </div>
                    <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-gray-900 px-4 py-2 rounded-full text-base font-bold shadow-lg">
                      {coupon.popup_badge}
                    </span>
                  </div>
                  <p className="text-white/90 text-sm font-medium">
                    {coupon.description || formatDescription(coupon)}
                  </p>
                </div>
              </div>
            ))}

            <p className="text-center text-sm text-gray-500 pt-4">
              👆 Click vào mã để sao chép
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
