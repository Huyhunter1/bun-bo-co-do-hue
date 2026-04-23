import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "today";

    // Calculate date condition
    let createdAtFilter: Record<string, any> = {};
    const now = new Date();

    if (period === "today") {
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0
      );
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      );
      createdAtFilter = { $gte: start, $lte: end };
    } else if (period === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      createdAtFilter = { $gte: weekAgo };
    } else if (period === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      createdAtFilter = { $gte: monthAgo };
    } else if (period === "year") {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      createdAtFilter = { $gte: yearAgo };
    }

    const orderBaseFilter: Record<string, any> = {};
    if (Object.keys(createdAtFilter).length > 0) {
      orderBaseFilter.created_at = createdAtFilter;
    }

    const completedOrderFilter = {
      ...orderBaseFilter,
      order_status: "completed",
    };

    const [revenueStats] = await db
      .collection("orders")
      .aggregate([
        { $match: completedOrderFilter },
        {
          $group: {
            _id: null,
            total_orders: { $sum: 1 },
            total_revenue: { $sum: "$total_amount" },
            avg_order_value: { $avg: "$total_amount" },
            total_discount: { $sum: "$discount_amount" },
          },
        },
        { $project: { _id: 0 } },
      ])
      .toArray();

    const ordersByStatus = await db
      .collection("orders")
      .aggregate([
        { $match: orderBaseFilter },
        { $group: { _id: "$order_status", count: { $sum: 1 } } },
      ])
      .toArray();

    const customersStats = await db.collection("orders").distinct("customer_phone");

    const reservationFilter: Record<string, any> = {};
    if (Object.keys(createdAtFilter).length > 0) {
      reservationFilter.created_at = createdAtFilter;
    }

    const [reservationsStats] = await db
      .collection("reservations")
      .aggregate([
        { $match: reservationFilter },
        {
          $group: {
            _id: null,
            total_reservations: { $sum: 1 },
            pending_reservations: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            confirmed_reservations: {
              $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
            },
            completed_reservations: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
          },
        },
        { $project: { _id: 0 } },
      ])
      .toArray();

    const topItems = await db
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
            "order.order_status": "completed",
            ...(Object.keys(createdAtFilter).length > 0
              ? { "order.created_at": createdAtFilter }
              : {}),
          },
        },
        {
          $group: {
            _id: "$item_name",
            total_quantity: { $sum: "$quantity" },
            total_revenue: {
              $sum: { $multiply: ["$item_price", "$quantity"] },
            },
          },
        },
        { $sort: { total_quantity: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const revenueByDay = await db
      .collection("orders")
      .aggregate([
        {
          $match: {
            order_status: "completed",
            created_at: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
            },
            orders: { $sum: 1 },
            revenue: { $sum: "$total_amount" },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    const paymentMethods = await db
      .collection("orders")
      .aggregate([
        { $match: completedOrderFilter },
        {
          $group: {
            _id: "$payment_method",
            count: { $sum: 1 },
            total: { $sum: "$total_amount" },
          },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: {
        revenue: {
          total: Number(revenueStats?.total_revenue || 0),
          orders: Number(revenueStats?.total_orders || 0),
          avgOrderValue: Number(revenueStats?.avg_order_value || 0),
          totalDiscount: Number(revenueStats?.total_discount || 0),
        },
        orders: {
          total: Number(revenueStats?.total_orders || 0),
          byStatus: ordersByStatus.map((row: any) => ({
            status: row._id,
            count: Number(row.count),
          })),
        },
        reservations: {
          total: Number(reservationsStats?.total_reservations || 0),
          pending: Number(reservationsStats?.pending_reservations || 0),
          confirmed: Number(reservationsStats?.confirmed_reservations || 0),
          completed: Number(reservationsStats?.completed_reservations || 0),
        },
        customers: {
          total: Number(customersStats.length || 0),
        },
        topItems: topItems.map((row: any) => ({
          name: row._id,
          quantity: Number(row.total_quantity),
          revenue: Number(row.total_revenue),
        })),
        revenueByDay: revenueByDay.map((row: any) => ({
          date: row._id,
          orders: Number(row.orders),
          revenue: Number(row.revenue),
        })),
        paymentMethods: paymentMethods.map((row: any) => ({
          method: row._id,
          count: Number(row.count),
          total: Number(row.total),
        })),
      },
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      {
        success: true,
        data: {
          revenue: {
            total: 0,
            orders: 0,
            avgOrderValue: 0,
            totalDiscount: 0,
          },
          orders: {
            total: 0,
            byStatus: [],
          },
          reservations: {
            total: 0,
            pending: 0,
            confirmed: 0,
            completed: 0,
          },
          customers: {
            total: 0,
          },
          topItems: [],
          revenueByDay: [],
          paymentMethods: [],
        },
        fallback: true,
        warning: "Không thể kết nối cơ sở dữ liệu, đang dùng dữ liệu dự phòng",
      },
      { status: 200 }
    );
  }
}
