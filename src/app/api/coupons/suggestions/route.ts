// API lấy danh sách coupon hiển thị trong gợi ý thanh toán
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import promosData from "@/data/promos.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const db = await getDb();
    const coupons = await db
      .collection("coupons")
      .find(
        {
          is_active: true,
          show_in_suggestions: true,
          $or: [{ valid_until: null }, { valid_until: { $gt: new Date() } }],
        },
        {
          projection: {
            _id: 0,
            id: 1,
            code: 1,
            description: 1,
            discount_type: 1,
            discount_value: 1,
            min_order_amount: 1,
            max_discount_amount: 1,
            suggestion_badge: 1,
            suggestion_priority: 1,
          },
        }
      )
      .sort({ suggestion_priority: 1, created_at: -1 })
      .limit(6)
      .toArray();

    // Format data for frontend
    const formatted = coupons.map((coupon: any) => ({
      code: coupon.code,
      description:
        coupon.description ||
        `Giảm ${
          coupon.discount_type === "percentage"
            ? `${coupon.discount_value}%`
            : `${(coupon.discount_value / 1000).toFixed(0)}K`
        } cho đơn từ ${(coupon.min_order_amount / 1000).toFixed(0)}K`,
      discount:
        coupon.suggestion_badge ||
        (coupon.discount_type === "percentage"
          ? `${coupon.discount_value}%`
          : `${(coupon.discount_value / 1000).toFixed(0)}K`),
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("Suggestion Coupons GET Error:", error);

    const fallbackData = (promosData as any[]).slice(0, 4).map((promo) => ({
      code: String(promo.code || "").toUpperCase(),
      description: promo.description || "Ưu đãi đặc biệt",
      discount:
        promo.discountType === "percentage"
          ? `${Number(promo.discountValue || 0)}%`
          : `${Math.round(Number(promo.discountValue || 0) / 1000)}K`,
    }));

    return NextResponse.json(
      {
        success: true,
        data: fallbackData,
        fallback: true,
        warning: "Không thể kết nối cơ sở dữ liệu, đang dùng dữ liệu dự phòng",
      },
      { status: 200 }
    );
  }
}
