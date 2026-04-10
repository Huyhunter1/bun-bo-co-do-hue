import { NextRequest, NextResponse } from "next/server";
import { getDb, getNextSequence, toNumberId } from "@/lib/mongodb";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = toNumberId(params.id);
    const db = await getDb();

    // Lấy thông tin đơn hàng
    const order: any = await db
      .collection("orders")
      .findOne({ id: orderId }, { projection: { _id: 0 } });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    // Kiểm tra email - ưu tiên customer_email trong bảng orders
    const customerEmail = order.customer_email;

    if (!customerEmail || customerEmail.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Khách hàng chưa có email" },
        { status: 400 }
      );
    }

    // Lấy chi tiết món ăn trong đơn
    const orderItems: any = await db
      .collection("order_items")
      .find({ order_id: orderId }, { projection: { _id: 0 } })
      .toArray();

    // Format order items cho email
    const formattedItems = orderItems.map((item: any) => ({
      name: item.item_name,
      quantity: item.quantity,
      price: item.subtotal || item.item_price * item.quantity,
    }));

    // Gửi email
    const result = await sendOrderConfirmationEmail(
      customerEmail,
      order.order_number,
      order.customer_name,
      formattedItems,
      order.total_amount,
      order.order_status
    );

    // Lưu log gửi email vào database
    const logStatus = result.success ? "sent" : "failed";

    try {
      const logId = await getNextSequence("email_logs");
      await db.collection("email_logs").insertOne({
        id: logId,
        order_id: orderId,
        email: customerEmail,
        subject: `Xác nhận đơn hàng #${order.order_number}`,
        status: logStatus,
        error_message: result.success ? null : result.message,
        message_id: result.messageId || null,
        sent_at: new Date(),
      });

      // Cập nhật trạng thái email_sent trong orders
      if (result.success) {
        await db.collection("orders").updateOne(
          { id: orderId },
          {
            $set: { email_sent: true, email_sent_at: new Date() },
            $inc: { email_count: 1 },
          }
        );
      }
    } catch (logError) {
      console.error("Failed to save email log:", logError);
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
    console.error("Error sending email:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi gửi email" },
      { status: 500 }
    );
  }
}
