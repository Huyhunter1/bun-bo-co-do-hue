// API để gửi email xác nhận đặt bàn
import { NextRequest, NextResponse } from "next/server";
import { getDb, getNextSequence, toNumberId } from "@/lib/mongodb";
import { sendReservationStatusEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = toNumberId(params.id);
    const db = await getDb();

    // Lấy thông tin đặt bàn
    const reservation: any = await db
      .collection("reservations")
      .findOne({ id }, { projection: { _id: 0 } });

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy đặt bàn" },
        { status: 404 }
      );
    }

    if (!reservation.customer_email) {
      return NextResponse.json(
        { success: false, error: "Đặt bàn này không có email" },
        { status: 400 }
      );
    }

    // Gửi email
    const emailResult = await sendReservationStatusEmail(
      reservation.customer_email,
      reservation.reservation_number,
      reservation.customer_name,
      reservation.status,
      reservation.reservation_date,
      reservation.reservation_time,
      reservation.number_of_guests
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: emailResult.message },
        { status: 500 }
      );
    }

    // Lưu log email
    try {
      const logId = await getNextSequence("email_logs");
      await db.collection("email_logs").insertOne({
        id: logId,
        reservation_id: id,
        email: reservation.customer_email,
        subject: `Cập nhật đặt bàn #${reservation.reservation_number}`,
        status: "sent",
        message_id: emailResult.messageId || null,
        sent_at: new Date(),
      });
    } catch (logError) {
      console.error("Error saving email log:", logError);
    }

    return NextResponse.json({
      success: true,
      message: "Email đã được gửi thành công",
      messageId: emailResult.messageId,
    });
  } catch (error: any) {
    console.error("Send reservation email error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Lỗi khi gửi email",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
