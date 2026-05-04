"use client";

import { useState, useEffect } from "react";
import { Tag, X, Copy, Check } from "lucide-react";

interface CouponInputProps {
  onApplyCoupon: (code: string) => void;
  appliedCoupon?: { code: string; description: string } | null;
  onRemoveCoupon: () => void;
  error?: string;
  isValidating?: boolean;
}

interface SuggestedCoupon {
  code: string;
  description: string;
  discount: string;
}

export default function CouponInput({
  onApplyCoupon,
  appliedCoupon,
  onRemoveCoupon,
  error,
  isValidating = false,
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copied, setCopied] = useState("");
  const [suggestedCoupons, setSuggestedCoupons] = useState<SuggestedCoupon[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch suggested coupons from API
    const fetchSuggestions = async () => {
      try {
        const response = await fetch("/api/coupons/suggestions", {
          cache: "no-store",
        });
        const data = await response.json();
        if (data.success) {
          setSuggestedCoupons(data.data);
        }
      } catch (error) {
        console.error("Error fetching coupon suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleApply = () => {
    if (couponCode.trim()) {
      onApplyCoupon(couponCode.toUpperCase());
    }
  };

  const handleQuickApply = (code: string) => {
    setCouponCode(code);
    onApplyCoupon(code);
    setShowSuggestions(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="mb-6">
      <label className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Tag size={18} className="text-hue-red" />
        <span>Mã Giảm Giá</span>
      </label>

      {/* Input Field */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Nhập mã giảm giá"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onFocus={() => setShowSuggestions(true)}
            disabled={!!appliedCoupon}
            className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition ${
              appliedCoupon
                ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                : error
                ? "border-red-500 focus:border-red-600"
                : "border-gray-300 focus:border-hue-red"
            }`}
            onKeyPress={(e) => e.key === "Enter" && handleApply()}
          />
          {showSuggestions && !appliedCoupon && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto">
              <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                <span className="font-semibold text-sm">Mã khả dụng:</span>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-2">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-hue-red border-t-transparent mx-auto mb-2"></div>
                    <span className="text-sm">Đang tải...</span>
                  </div>
                ) : suggestedCoupons.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <span className="text-sm">
                      Không có mã giảm giá khả dụng
                    </span>
                  </div>
                ) : (
                  suggestedCoupons.map((coupon) => (
                    <div
                      key={coupon.code}
                      className="p-3 hover:bg-hue-cream rounded-lg cursor-pointer transition group"
                      onClick={() => handleQuickApply(coupon.code)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-hue-red">
                            {coupon.code}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(coupon.code);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition"
                          >
                            {copied === coupon.code ? (
                              <Check size={14} className="text-green-600" />
                            ) : (
                              <Copy size={14} className="text-gray-500" />
                            )}
                          </button>
                        </div>
                        <span className="bg-hue-gold text-hue-redDark text-xs px-2 py-1 rounded-full font-bold">
                          {coupon.discount}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {coupon.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 bg-gray-50 border-t text-center">
                <p className="text-xs text-gray-500">
                  💡 Click để áp dụng nhanh hoặc nhấn icon copy
                </p>
              </div>
            </div>
          )}
        </div>

        {appliedCoupon ? (
          <button
            onClick={() => {
              onRemoveCoupon();
              setCouponCode("");
            }}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
          >
            Hủy
          </button>
        ) : (
          <button
            onClick={handleApply}
            disabled={!couponCode.trim() || isValidating}
            className="px-6 py-3 bg-hue-red text-white rounded-lg hover:bg-hue-redDark transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Kiểm tra...</span>
              </>
            ) : (
              "Áp dụng"
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && !appliedCoupon && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {appliedCoupon && (
        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
          <span>✓</span>
          <span>
            Đã áp dụng <strong>{appliedCoupon.code}</strong> -{" "}
            {appliedCoupon.description}
          </span>
        </div>
      )}

      {/* Quick Access Chips */}
      {!appliedCoupon && !showSuggestions && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">Mã phổ biến:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedCoupons.slice(0, 3).map((coupon) => (
              <button
                key={coupon.code}
                onClick={() => handleQuickApply(coupon.code)}
                className="px-3 py-1 bg-hue-cream text-hue-red border border-hue-gold rounded-full text-xs font-semibold hover:bg-hue-gold hover:text-hue-redDark transition"
              >
                {coupon.code}
              </button>
            ))}
            <button
              onClick={() => setShowSuggestions(true)}
              className="px-3 py-1 bg-white border-2 border-gray-300 rounded-full text-xs font-semibold hover:border-hue-red transition"
            >
              Xem tất cả →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
