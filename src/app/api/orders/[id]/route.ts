// src/app/api/orders/[id]/route.ts - API chi tiết đơn hàng
import { NextRequest, NextResponse } from "next/server";
import { getDb, toNumberId } from "@/lib/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = toNumberId(params.id);
    const db = await getDb();

    // Lấy thông tin đơn hàng
    const order = await db
      .collection("orders")
      .findOne({ id }, { projection: { _id: 0 } });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    // Lấy chi tiết món
    const items = await db
      .collection("order_items")
      .find({ order_id: id }, { projection: { _id: 0 } })
      .toArray();

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        items,
      },
    });
  } catch (error: any) {
    console.error("Order Detail Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể tải đơn hàng",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Cập nhật trạng thái đơn hàng
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = toNumberId(params.id);
    const db = await getDb();
    const body = await request.json();
    const { order_status, payment_status } = body;

    const updates: Record<string, any> = { updated_at: new Date() };
    if (order_status) {
      updates.order_status = order_status;
    }
    if (payment_status) {
      updates.payment_status = payment_status;
    }

    await db.collection("orders").updateOne({ id }, { $set: updates });

    return NextResponse.json({
      success: true,
      message: "Cập nhật đơn hàng thành công",
    });
  } catch (error: any) {
    console.error("Order PUT Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể cập nhật đơn hàng",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params });
}

// Xóa đơn hàng
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = toNumberId(params.id);
    const db = await getDb();

    // Xóa order_items trước
    await db.collection("order_items").deleteMany({ order_id: id });

    // Xóa order
    await db.collection("orders").deleteOne({ id });

    return NextResponse.json({
      success: true,
      message: "Xóa đơn hàng thành công",
    });
  } catch (error: any) {
    console.error("Order DELETE Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể xóa đơn hàng",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
