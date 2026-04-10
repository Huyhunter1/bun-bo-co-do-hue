// src/app/api/coupons/validate/route.ts - API validate coupon
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { code, orderAmount } = body;

    if (!code || orderAmount === undefined) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin" },
        { status: 400 }
      );
    }

    // Tìm coupon trong database
    const coupon = await db.collection("coupons").findOne<any>({
      code: code.toUpperCase(),
      is_active: true,
    });

    if (!coupon) {
      return NextResponse.json({
        success: true,
        valid: false,
        discount: 0,
        message: "Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa",
      });
    }

    // Kiểm tra hết hạn
    if (coupon.valid_until) {
      const expiryDate = new Date(coupon.valid_until);
      if (expiryDate < new Date()) {
        return NextResponse.json({
          success: true,
          valid: false,
          discount: 0,
          message: "Mã giảm giá đã hết hạn",
        });
      }
    }

    // Kiểm tra đơn hàng tối thiểu
    if (orderAmount < (coupon.min_order_amount || 0)) {
      return NextResponse.json({
        success: true,
        valid: false,
        discount: 0,
        message: `Đơn hàng tối thiểu ${new Intl.NumberFormat("vi-VN").format(
          coupon.min_order_amount
        )}đ`,
      });
    }

    // Kiểm tra giới hạn sử dụng
    if (coupon.usage_limit && coupon.usage_limit > 0) {
      const usedCount = coupon.used_count || 0;
      if (usedCount >= coupon.usage_limit) {
        return NextResponse.json({
          success: true,
          valid: false,
          discount: 0,
          message: "Mã giảm giá đã hết lượt sử dụng",
        });
      }
    }

    // Tính toán giảm giá
    let discount = 0;
    if (coupon.discount_type === "percentage") {
      discount = (orderAmount * parseFloat(coupon.discount_value)) / 100;
      // Áp dụng giảm tối đa nếu có
      if (coupon.max_discount_amount && coupon.max_discount_amount > 0) {
        discount = Math.min(discount, parseFloat(coupon.max_discount_amount));
      }
    } else {
      // Fixed amount
      discount = parseFloat(coupon.discount_value);
    }

    // Đảm bảo không giảm quá tổng đơn
    discount = Math.min(discount, orderAmount);

    return NextResponse.json({
      success: true,
      valid: true,
      discount: Math.round(discount),
      message: `Giảm ${new Intl.NumberFormat("vi-VN").format(
        Math.round(discount)
      )}đ cho đơn hàng`,
      couponData: {
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
    });
  } catch (error: any) {
    console.error("Coupon Validate Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể kiểm tra mã giảm giá",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
