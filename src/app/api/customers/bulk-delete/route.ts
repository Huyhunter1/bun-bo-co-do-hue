// API để xóa nhiều khách hàng cùng lúc
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phones } = body;

    if (!Array.isArray(phones) || phones.length === 0) {
      return NextResponse.json(
        { success: false, error: "Danh sách số điện thoại không hợp lệ" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Lấy tất cả order IDs của các khách hàng
    const orders = await db
      .collection("orders")
      .find({ customer_phone: { $in: phones } })
      .toArray();

    const orderIds = orders.map((o: any) => o.id);

    // Xóa order items
    if (orderIds.length > 0) {
      await db.collection("order_items").deleteMany({
        order_id: { $in: orderIds },
      });
    }

    // Xóa orders
    const ordersResult = await db.collection("orders").deleteMany({
      customer_phone: { $in: phones },
    });

    // Xóa reservations
    const reservationsResult = await db.collection("reservations").deleteMany({
      customer_phone: { $in: phones },
    });

    return NextResponse.json({
      success: true,
      message: `Xóa ${phones.length} khách hàng thành công`,
      deleted: {
        customers: phones.length,
        orders: ordersResult.deletedCount,
        reservations: reservationsResult.deletedCount,
      },
    });
  } catch (error: any) {
    console.error("Customer Bulk Delete Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể xóa các khách hàng",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
