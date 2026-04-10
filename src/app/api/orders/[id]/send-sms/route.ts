// API endpoint để gửi SMS thông báo đơn hàng
import { NextRequest, NextResponse } from "next/server";
import { getDb, getNextSequence, toNumberId } from "@/lib/mongodb";
import { sendOrderStatusSMS } from "@/lib/sms";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = toNumberId(params.id);
    const db = await getDb();

    // Lấy thông tin đơn hàng
    const order = await db
      .collection("orders")
      .findOne<any>({ id: orderId }, { projection: { _id: 0 } });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    // Gửi SMS
    const result = await sendOrderStatusSMS(
      order.customer_phone,
      order.order_number,
      order.order_status,
      order.customer_name
    );

    // Lưu log vào database
    const logStatus = result.success ? "sent" : "failed";
    const messageContent = result.messageContent || "";

    try {
      const logId = await getNextSequence("sms_logs");
      await db.collection("sms_logs").insertOne({
        id: logId,
        order_id: orderId,
        phone_number: order.customer_phone,
        message_type: "order_status",
        message_content: messageContent,
        status: logStatus,
        error_message: result.success ? null : result.message,
        provider: (process.env.SMS_PROVIDER || "infobip").toLowerCase(),
        message_id: result.messageId || null,
        sent_at: new Date(),
      });
    } catch (logError) {
      console.error("Failed to save SMS log:", logError);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("SMS Send Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể gửi SMS",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
