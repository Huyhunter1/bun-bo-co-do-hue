// src/app/api/reservations/[id]/route.ts - API chi tiết đặt bàn
import { NextRequest, NextResponse } from "next/server";
import { getDb, getNextSequence, toNumberId } from "@/lib/mongodb";
import { sendReservationStatusEmail } from "@/lib/email";

// Cập nhật trạng thái đặt bàn
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = toNumberId(params.id);
    const db = await getDb();
    const body = await request.json();
    const { status, table_number } = body;

    // Lấy thông tin đặt bàn trước khi update
    const reservation: any = await db
      .collection("reservations")
      .findOne({ id }, { projection: { _id: 0 } });

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy đặt bàn" },
        { status: 404 }
      );
    }

    const updates: Record<string, any> = { updated_at: new Date() };
    if (status) {
      updates.status = status;
    }
    if (table_number) {
      updates.table_number = table_number;
    }

    await db.collection("reservations").updateOne({ id }, { $set: updates });

    // Gửi email nếu có thay đổi trạng thái và có email
    if (status && reservation.customer_email) {
      try {
        await sendReservationStatusEmail(
          reservation.customer_email,
          reservation.reservation_number,
          reservation.customer_name,
          status,
          reservation.reservation_date,
          reservation.reservation_time,
          reservation.number_of_guests
        );

        // Lưu log email
        const logId = await getNextSequence("email_logs");
        await db.collection("email_logs").insertOne({
          id: logId,
          reservation_id: id,
          email: reservation.customer_email,
          subject: `Cập nhật đặt bàn #${reservation.reservation_number}`,
          status: "sent",
          sent_at: new Date(),
        });
      } catch (emailError) {
        console.error("Error sending reservation status email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật đặt bàn thành công",
    });
  } catch (error: any) {
    console.error("Reservation PATCH Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể cập nhật đặt bàn",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Xóa đặt bàn
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = toNumberId(params.id);
    const db = await getDb();
    await db.collection("reservations").deleteOne({ id });

    return NextResponse.json({
      success: true,
      message: "Xóa đặt bàn thành công",
    });
  } catch (error: any) {
    console.error("Reservation DELETE Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể xóa đặt bàn",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
