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
  const quickCoupons = suggestedCoupons.slice(0, 3);

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
    <div className="mb-6 rounded-2xl border border-hue-gold/25 bg-gradient-to-br from-white to-hue-cream/30 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-hue-red/10 text-hue-red">
          <Tag size={18} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-900">
            Mã Giảm Giá
          </label>
          <p className="text-xs text-gray-500">
            Chọn mã đang ưu tiên hoặc nhập mã bạn có
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            <Tag size={16} />
          </div>
          <input
            type="text"
            placeholder="Nhập mã giảm giá"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onFocus={() => setShowSuggestions(true)}
            disabled={!!appliedCoupon}
            className={`w-full rounded-xl border-2 bg-white py-3 pl-11 pr-4 text-sm font-semibold uppercase tracking-wide outline-none transition focus:ring-4 focus:ring-hue-red/10 ${
              appliedCoupon
                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                : error
                ? "border-red-400 focus:border-red-500"
                : "border-gray-300 focus:border-hue-red"
            }`}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
          />

          {showSuggestions && !appliedCoupon && (
            <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
                <div>
                  <span className="text-sm font-bold text-gray-900">
                    Mã khả dụng
                  </span>
                  <p className="text-[11px] text-gray-500">
                    Chọn nhanh mã đang được ưu tiên hiển thị
                  </p>
                </div>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="rounded-full p-1 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto p-2">
                {loading ? (
                  <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-gray-500">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-hue-red border-t-transparent"></div>
                    <span className="text-sm">Đang tải mã giảm giá...</span>
                  </div>
                ) : suggestedCoupons.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500">
                    <span className="text-sm">
                      Không có mã giảm giá khả dụng
                    </span>
                  </div>
                ) : (
                  suggestedCoupons.map((coupon, index) => (
                    <button
                      key={coupon.code}
                      type="button"
                      onClick={() => handleQuickApply(coupon.code)}
                      className="group w-full rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-hue-gold hover:bg-hue-cream/60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-hue-red/10 px-2.5 py-1 text-sm font-extrabold tracking-wide text-hue-red">
                              {coupon.code}
                            </span>
                            <span className="rounded-full bg-hue-gold/25 px-2 py-1 text-[11px] font-bold text-hue-redDark">
                              #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCode(coupon.code);
                              }}
                              className="rounded-full p-1 text-gray-500 opacity-70 transition hover:bg-white hover:text-gray-700 group-hover:opacity-100"
                            >
                              {copied === coupon.code ? (
                                <Check size={14} className="text-green-600" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                            {coupon.description}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-gradient-to-r from-hue-red to-hue-gold px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                          {coupon.discount}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="border-t bg-gray-50 px-4 py-3 text-center">
                <p className="text-xs text-gray-500">
                  Mẹo: bấm trực tiếp vào mã để áp dụng nhanh hoặc copy để lưu
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
            className="inline-flex items-center justify-center rounded-xl bg-gray-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-gray-700"
          >
            Hủy
          </button>
        ) : (
          <button
            onClick={handleApply}
            disabled={!couponCode.trim() || isValidating}
            className="inline-flex min-w-[112px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-hue-red to-hue-redDark px-5 py-3 font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-600"
          >
            {isValidating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Kiểm tra...</span>
              </>
            ) : (
              "Áp dụng"
            )}
          </button>
        )}
      </div>

      {error && !appliedCoupon && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {appliedCoupon && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check size={16} />
          </div>
          <div>
            <p className="font-semibold">
              Đã áp dụng mã <span className="font-extrabold">{appliedCoupon.code}</span>
            </p>
            <p className="text-green-700/80">{appliedCoupon.description}</p>
          </div>
        </div>
      )}

      {!appliedCoupon && !showSuggestions && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Mã phổ biến
            </p>
            <button
              onClick={() => setShowSuggestions(true)}
              className="text-xs font-semibold text-hue-red transition hover:text-hue-redDark"
            >
              Xem tất cả →
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {quickCoupons.map((coupon) => (
              <button
                key={coupon.code}
                onClick={() => handleQuickApply(coupon.code)}
                className="inline-flex items-center gap-2 rounded-full border border-hue-gold/40 bg-white px-3.5 py-1.5 text-xs font-bold text-hue-red shadow-sm transition hover:-translate-y-0.5 hover:border-hue-red hover:shadow-md"
              >
                <span>{coupon.code}</span>
                <span className="rounded-full bg-hue-gold/20 px-2 py-0.5 text-[10px] font-extrabold text-hue-redDark">
                  {coupon.discount}
                </span>
              </button>
            ))}

            <button
              onClick={() => setShowSuggestions(true)}
              className="inline-flex items-center gap-2 rounded-full border border-dashed border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-hue-red hover:text-hue-red"
            >
              <span>Xem thêm</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
