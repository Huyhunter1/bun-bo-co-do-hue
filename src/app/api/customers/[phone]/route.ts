import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    const db = await getDb();
    const phone = params.phone;

    // Get customer orders
    const orders = await db
      .collection("orders")
      .find(
        { customer_phone: phone },
        {
          projection: {
            _id: 0,
            id: 1,
            order_number: 1,
            total_amount: 1,
            order_status: 1,
            created_at: 1,
            delivery_address: 1,
          },
        }
      )
      .sort({ created_at: -1 })
      .toArray();

    // Get customer reservations
    const reservations = await db
      .collection("reservations")
      .find(
        { customer_phone: phone },
        {
          projection: {
            _id: 0,
            id: 1,
            reservation_number: 1,
            reservation_date: 1,
            reservation_time: 1,
            number_of_guests: 1,
            status: 1,
            special_requests: 1,
            created_at: 1,
          },
        }
      )
      .sort({ created_at: -1 })
      .toArray();

    // Get favorite items (most ordered)
    const orderIds = orders.map((o: any) => o.id);
    const favoriteItemsRaw =
      orderIds.length > 0
        ? await db
            .collection("order_items")
            .aggregate([
              { $match: { order_id: { $in: orderIds } } },
              {
                $group: {
                  _id: "$item_name",
                  order_count: { $sum: 1 },
                  total_quantity: { $sum: "$quantity" },
                  total_spent: {
                    $sum: { $multiply: ["$item_price", "$quantity"] },
                  },
                },
              },
              { $sort: { order_count: -1, total_quantity: -1 } },
              { $limit: 5 },
            ])
            .toArray()
        : [];

    const favoriteItems = favoriteItemsRaw.map((item: any) => ({
      item_name: item._id,
      order_count: item.order_count,
      total_quantity: item.total_quantity,
      total_spent: item.total_spent,
    }));

    return NextResponse.json({
      success: true,
      data: {
        orders,
        reservations,
        favoriteItems,
      },
    });
  } catch (error: any) {
    console.error("Customer detail GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể tải thông tin khách hàng",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
