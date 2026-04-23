// API để lấy danh sách SMS logs từ database
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Lấy danh sách SMS logs
    const smsLogs = await db
      .collection("sms_logs")
      .aggregate([
        { $sort: { sent_at: -1 } },
        { $skip: offset },
        { $limit: limit },
        {
          $lookup: {
            from: "orders",
            localField: "order_id",
            foreignField: "id",
            as: "order",
          },
        },
        {
          $project: {
            _id: 0,
            id: 1,
            order_id: 1,
            phone_number: 1,
            message_type: 1,
            message_content: 1,
            status: 1,
            error_message: 1,
            provider: 1,
            message_id: 1,
            sent_at: 1,
            cost: 1,
            order_number: { $arrayElemAt: ["$order.order_number", 0] },
            customer_name: { $arrayElemAt: ["$order.customer_name", 0] },
          },
        },
      ])
      .toArray();

    // Lấy tổng số
    const total = await db.collection("sms_logs").countDocuments();

    // Lấy thống kê
    const [stats] = await db
      .collection("sms_logs")
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            sent: {
              $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] },
            },
            failed: {
              $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            total_cost: { $sum: "$cost" },
          },
        },
        { $project: { _id: 0 } },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: smsLogs,
      stats: stats || {
        total: 0,
        sent: 0,
        failed: 0,
        pending: 0,
        total_cost: 0,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("SMS Logs GET Error:", error);
    return NextResponse.json(
      {
        success: true,
        data: [],
        stats: {
          total: 0,
          sent: 0,
          failed: 0,
          pending: 0,
          total_cost: 0,
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
        fallback: true,
        warning: "Không thể kết nối cơ sở dữ liệu, đang dùng dữ liệu dự phòng",
      },
      { status: 200 }
    );
  }
}
