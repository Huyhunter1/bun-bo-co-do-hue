// src/app/api/coupons/route.ts - API quản lý mã giảm giá
import { NextRequest, NextResponse } from "next/server";
import { getDb, getNextSequence } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Lấy danh sách coupon
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get("active");

    const filter: Record<string, any> = {};
    if (active === "true") {
      filter.is_active = true;
      filter.$or = [{ valid_until: null }, { valid_until: { $gt: new Date() } }];
    }

    const coupons = await db
      .collection("coupons")
      .find(filter, { projection: { _id: 0 } })
      .sort({ updated_at: -1, created_at: -1 })
      .toArray();

    return NextResponse.json(
      {
        success: true,
        data: coupons,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("Coupons GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể tải mã giảm giá",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Tạo coupon mới
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      usage_limit,
      valid_until,
      is_active,
      show_in_popup,
      popup_priority,
      popup_badge,
      popup_gradient,
    } = body;

    const normalizedCode = String(code || "").trim().toUpperCase();
    if (!normalizedCode) {
      return NextResponse.json(
        { success: false, error: "Mã giảm giá không hợp lệ" },
        { status: 400 }
      );
    }

    const existed = await db
      .collection("coupons")
      .findOne({ code: normalizedCode }, { projection: { _id: 1 } });

    if (existed) {
      return NextResponse.json(
        { success: false, error: "Mã giảm giá đã tồn tại" },
        { status: 409 }
      );
    }

    const couponId = await getNextSequence("coupons");
    const couponDoc = {
      id: couponId,
      code: normalizedCode,
      description: description || null,
      discount_type: discount_type === "fixed" ? "fixed" : "percentage",
      discount_value: Number(discount_value || 0),
      min_order_amount: Number(min_order_amount || 0),
      max_discount_amount:
        max_discount_amount === undefined || max_discount_amount === null
          ? null
          : Number(max_discount_amount),
      usage_limit:
        usage_limit === undefined || usage_limit === null
          ? null
          : Number(usage_limit),
      used_count: 0,
      valid_from: new Date(),
      valid_until: valid_until ? new Date(valid_until) : null,
      is_active: Boolean(is_active ?? true),
      show_in_popup: Boolean(show_in_popup),
      popup_priority: Number(popup_priority || 999),
      popup_badge: popup_badge || null,
      popup_gradient: popup_gradient || null,
      show_in_suggestions: Boolean(body.show_in_suggestions),
      suggestion_priority: Number(body.suggestion_priority || 999),
      suggestion_badge: body.suggestion_badge || null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.collection("coupons").insertOne(couponDoc);

    return NextResponse.json({
      success: true,
      message: "Tạo mã giảm giá thành công",
      data: couponDoc,
    });
  } catch (error: any) {
    console.error("Coupons POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể tạo mã giảm giá",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
