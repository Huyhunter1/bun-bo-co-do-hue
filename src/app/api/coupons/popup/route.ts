// API lấy danh sách coupon hiển thị trong popup
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

function normalizePopupGradient(rawGradient?: string | null): string {
  if (!rawGradient) {
    return "linear-gradient(135deg, #dc2626 0%, #f97316 100%)";
  }

  if (rawGradient.includes("linear-gradient")) {
    return rawGradient;
  }

  const trimmed = rawGradient.trim();

  if (trimmed === "from-red-500 to-orange-500") {
    return "linear-gradient(135deg, #ef4444 0%, #f97316 100%)";
  }

  if (trimmed === "from-amber-500 to-red-500") {
    return "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)";
  }

  return "linear-gradient(135deg, #dc2626 0%, #f97316 100%)";
}

export async function GET() {
  try {
    const db = await getDb();
    const coupons = await db
      .collection("coupons")
      .find(
        {
          is_active: true,
          show_in_popup: true,
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
            popup_badge: 1,
            popup_gradient: 1,
            popup_priority: 1,
          },
        }
      )
      .sort({ popup_priority: 1, created_at: -1 })
      .limit(5)
      .toArray();

    const normalizedCoupons = coupons.map((coupon: any) => ({
      ...coupon,
      popup_gradient: normalizePopupGradient(coupon.popup_gradient),
    }));

    return NextResponse.json({
      success: true,
      data: normalizedCoupons,
    });
  } catch (error: any) {
    console.error("Popup Coupons GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể tải mã giảm giá popup",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
