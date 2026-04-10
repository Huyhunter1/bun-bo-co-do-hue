import { NextRequest, NextResponse } from "next/server";
import { getDb, toNumberId } from "@/lib/mongodb";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = toNumberId(params.id);
    const db = await getDb();

    // Delete SMS log
    await db.collection("sms_logs").deleteOne({ id });

    return NextResponse.json({
      success: true,
      message: "SMS log deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting SMS log:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete SMS log",
      },
      { status: 500 }
    );
  }
}
