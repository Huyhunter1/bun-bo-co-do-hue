// src/app/api/orders/route.ts - API quản lý đơn hàng
import { NextRequest, NextResponse } from "next/server";
import { getDb, getNextSequence } from "@/lib/mongodb";

// Lấy danh sách đơn hàng
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (status) {
      filter.order_status = status;
    }

    const [orders, total] = await Promise.all([
      db
        .collection("orders")
        .find(filter, { projection: { _id: 0 } })
        .sort({ created_at: -1 })
        .skip(offset)
        .limit(limit)
        .toArray(),
      db.collection("orders").countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Orders GET Error:", error);
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

// Tạo đơn hàng mới
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    console.log("📥 Received order data:", JSON.stringify(body, null, 2));

    const {
      orderNumber,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      paymentMethod,
      items,
      subtotal,
      discount,
      total,
      couponCode,
    } = body;

    console.log("📋 Order details:", {
      orderNumber,
      customerName,
      customerPhone,
      itemCount: items?.length,
      total,
    });

    const orderId = await getNextSequence("orders");
    await db.collection("orders").insertOne({
      id: orderId,
      order_number: orderNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || null,
      delivery_address: customerAddress || null,
      order_type: "delivery",
      subtotal,
      discount_amount: discount,
      delivery_fee: 0,
      total_amount: total,
      coupon_code: couponCode || null,
      payment_method: paymentMethod,
      payment_status: "pending",
      order_status: "pending",
      email_sent: false,
      email_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const itemDocs = [];
    for (const item of items || []) {
      const itemTotal = item.price * item.quantity;
      const menuItemIdNumber =
        typeof item.menuItemId === "number"
          ? item.menuItemId
          : typeof item.menuItemId === "string" &&
            !Number.isNaN(Number.parseInt(item.menuItemId, 10))
          ? Number.parseInt(item.menuItemId, 10)
          : null;

      const itemId = await getNextSequence("order_items");
      itemDocs.push({
        id: itemId,
        order_id: orderId,
        menu_item_id: menuItemIdNumber,
        item_name: item.menuItemName,
        item_price: item.price,
        quantity: item.quantity,
        toppings:
          Array.isArray(item.toppings) && item.toppings.length > 0
            ? JSON.stringify(item.toppings)
            : null,
        subtotal: itemTotal,
        notes: item.note || null,
        created_at: new Date(),
      });
    }

    if (itemDocs.length > 0) {
      await db.collection("order_items").insertMany(itemDocs);
    }

    if (couponCode) {
      await db.collection("coupons").updateOne(
        { code: couponCode, is_active: true },
        { $inc: { used_count: 1 }, $set: { updated_at: new Date() } }
      );
    }

    const result = { orderId, orderNumber };

    console.log("✅ Order created successfully:", result);

    return NextResponse.json({
      success: true,
      message: "Đặt hàng thành công",
      data: result,
    });
  } catch (error: any) {
    console.error("❌ Orders POST Error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể tạo đơn hàng",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
