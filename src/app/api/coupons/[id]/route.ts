// src/app/api/coupons/[id]/route.ts - API chi tiết coupon
import { NextRequest, NextResponse } from "next/server";
import { getDb, toNumberId } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Cập nhật coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = toNumberId(params.id);
    const db = await getDb();
    const body = await request.json();

    // Lấy thông tin coupon hiện tại
    const currentCoupon: any = await db
      .collection("coupons")
      .findOne({ id }, { projection: { _id: 0 } });

    if (!currentCoupon) {
      return NextResponse.json(
        {
          success: false,
          error: "Không tìm thấy mã giảm giá",
        },
        { status: 404 }
      );
    }

    // Merge dữ liệu mới với dữ liệu hiện tại
    const updatedData = {
      ...currentCoupon,
      ...body,
    };

    const nextCode = String(updatedData.code || currentCoupon.code || "")
      .trim()
      .toUpperCase();

    if (!nextCode) {
      return NextResponse.json(
        { success: false, error: "Mã giảm giá không hợp lệ" },
        { status: 400 }
      );
    }

    const duplicate = await db.collection("coupons").findOne(
      { code: nextCode, id: { $ne: id } },
      { projection: { _id: 1 } }
    );

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: "Mã giảm giá đã tồn tại" },
        { status: 409 }
      );
    }

    const nextDoc = {
      code: nextCode,
      description: updatedData.description || null,
      discount_type:
        updatedData.discount_type === "fixed" ? "fixed" : "percentage",
      discount_value: Number(updatedData.discount_value || 0),
      min_order_amount: Number(updatedData.min_order_amount || 0),
      max_discount_amount:
        updatedData.max_discount_amount === undefined ||
        updatedData.max_discount_amount === null
          ? null
          : Number(updatedData.max_discount_amount),
      usage_limit:
        updatedData.usage_limit === undefined || updatedData.usage_limit === null
          ? null
          : Number(updatedData.usage_limit),
      valid_until: updatedData.valid_until
        ? new Date(updatedData.valid_until)
        : null,
      is_active: Boolean(updatedData.is_active),
      show_in_popup: Boolean(updatedData.show_in_popup),
      popup_priority: Number(updatedData.popup_priority || 999),
      popup_badge: updatedData.popup_badge || null,
      popup_gradient: updatedData.popup_gradient || null,
      show_in_suggestions: Boolean(updatedData.show_in_suggestions),
      suggestion_priority: Number(updatedData.suggestion_priority || 999),
      suggestion_badge: updatedData.suggestion_badge || null,
      updated_at: new Date(),
    };

    await db.collection("coupons").updateOne(
      { id },
      {
        $set: nextDoc,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Cập nhật mã giảm giá thành công",
      data: {
        ...currentCoupon,
        ...nextDoc,
      },
    });
  } catch (error: any) {
    console.error("Coupon PUT Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể cập nhật mã giảm giá",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Xóa coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = toNumberId(params.id);
    const db = await getDb();
    await db.collection("coupons").deleteOne({ id });

    return NextResponse.json({
      success: true,
      message: "Xóa mã giảm giá thành công",
    });
  } catch (error: any) {
    console.error("Coupon DELETE Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể xóa mã giảm giá",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
