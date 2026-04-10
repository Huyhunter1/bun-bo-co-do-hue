// src/app/api/stats/route.ts - API thống kê cho dashboard
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const nextMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      0,
      0,
      0,
      0
    );

    // Tổng doanh thu hôm nay
    const [todayStats] = await db
      .collection("orders")
      .aggregate<any>([
        {
          $match: {
            created_at: { $gte: todayStart, $lte: todayEnd },
            order_status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total_amount" },
            orders: { $sum: 1 },
          },
        },
        { $project: { _id: 0 } },
      ])
      .toArray();

    // Tổng doanh thu tháng này
    const [monthStats] = await db
      .collection("orders")
      .aggregate<any>([
        {
          $match: {
            created_at: { $gte: monthStart, $lt: nextMonthStart },
            order_status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total_amount" },
            orders: { $sum: 1 },
          },
        },
        { $project: { _id: 0 } },
      ])
      .toArray();

    // Số đơn hàng theo trạng thái
    const ordersByStatus = await db
      .collection("orders")
      .aggregate([
        { $match: { created_at: { $gte: todayStart, $lte: todayEnd } } },
        { $group: { _id: "$order_status", count: { $sum: 1 } } },
      ])
      .toArray();

    // Đơn hàng gần đây
    const recentOrders = await db
      .collection("orders")
      .find(
        {},
        {
          projection: {
            _id: 0,
            id: 1,
            order_number: 1,
            customer_name: 1,
            customer_phone: 1,
            total_amount: 1,
            order_status: 1,
            payment_status: 1,
            created_at: 1,
          },
        }
      )
      .sort({ created_at: -1 })
      .limit(10)
      .toArray();

    // Top món bán chạy
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const topItemsRaw = await db
      .collection("order_items")
      .aggregate([
        {
          $lookup: {
            from: "orders",
            localField: "order_id",
            foreignField: "id",
            as: "order",
          },
        },
        { $unwind: "$order" },
        {
          $match: {
            "order.created_at": { $gte: sevenDaysAgo },
            "order.order_status": { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: "$menu_item_id",
            name: { $first: "$item_name" },
            total_sold: { $sum: "$quantity" },
            revenue: { $sum: "$subtotal" },
          },
        },
        { $sort: { total_sold: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    const topItems = topItemsRaw.map((item: any) => ({
      name: item.name,
      total_sold: item.total_sold,
      revenue: item.revenue,
    }));

    // Đặt bàn hôm nay
    const todayDateText = now.toISOString().split("T")[0];
    const todayReservationsCount = await db.collection("reservations").countDocuments({
      reservation_date: todayDateText,
      status: { $nin: ["cancelled", "no-show"] },
    });

    return NextResponse.json({
      success: true,
      data: {
        today: {
          revenue: todayStats?.revenue || 0,
          orders: todayStats?.orders || 0,
          reservations: todayReservationsCount,
        },
        month: {
          revenue: monthStats?.revenue || 0,
          orders: monthStats?.orders || 0,
        },
        ordersByStatus: ordersByStatus.map((row: any) => ({
          order_status: row._id,
          count: row.count,
        })),
        recentOrders,
        topItems,
      },
    });
  } catch (error: any) {
    console.error("Stats API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể tải thống kê",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
