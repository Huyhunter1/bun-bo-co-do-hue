import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Lấy danh sách email logs
    const emailLogs: any = await db
      .collection("email_logs")
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
          $lookup: {
            from: "reservations",
            localField: "reservation_id",
            foreignField: "id",
            as: "reservation",
          },
        },
        {
          $project: {
            _id: 0,
            id: 1,
            order_id: 1,
            reservation_id: 1,
            email: 1,
            recipient_email: "$email",
            subject: 1,
            status: 1,
            error_message: 1,
            message_id: 1,
            sent_at: 1,
            order_number: { $arrayElemAt: ["$order.order_number", 0] },
            customer_name: { $arrayElemAt: ["$order.customer_name", 0] },
            reservation_number: {
              $arrayElemAt: ["$reservation.reservation_number", 0],
            },
            reservation_customer_name: {
              $arrayElemAt: ["$reservation.customer_name", 0],
            },
          },
        },
      ])
      .toArray();

    const withType = emailLogs.map((el: any) => {
      let messageType = "other";
      if ((el.subject || "").includes("Xác nhận đơn hàng")) {
        messageType = "order_confirmation";
      } else if (
        (el.subject || "").includes("trạng thái") ||
        (el.subject || "").includes("Cập nhật đơn")
      ) {
        messageType = "order_status";
      } else if (
        (el.subject || "").includes("đặt bàn") ||
        (el.subject || "").includes("Cập nhật đặt bàn")
      ) {
        messageType = "reservation";
      }
      return { ...el, message_type: messageType };
    });

    // Lấy thống kê
    const [stats]: any = await db
      .collection("email_logs")
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
          },
        },
        { $project: { _id: 0 } },
      ])
      .toArray();

    // Lấy tổng số để tính pagination
    const totalCount = await db.collection("email_logs").countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: withType,
      stats: {
        total: stats?.total || 0,
        sent: stats?.sent || 0,
        failed: stats?.failed || 0,
        pending: stats?.pending || 0,
      },
      pagination: {
        page,
        limit,
        totalPages,
        totalCount,
      },
    });
  } catch (error: any) {
    console.error("Error fetching email logs:", error);
    return NextResponse.json(
      {
        success: true,
        data: [],
        stats: {
          total: 0,
          sent: 0,
          failed: 0,
          pending: 0,
        },
        pagination: {
          page: 1,
          limit: 50,
          totalPages: 0,
          totalCount: 0,
        },
        fallback: true,
        warning: "Không thể kết nối cơ sở dữ liệu, đang dùng dữ liệu dự phòng",
      },
      { status: 200 }
    );
  }
}
