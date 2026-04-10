import { NextRequest, NextResponse } from "next/server";
import { getDb, toNumberId } from "@/lib/mongodb";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = toNumberId(params.id);
    const db = await getDb();

    // Delete email log
    await db.collection("email_logs").deleteOne({ id });

    return NextResponse.json({
      success: true,
      message: "Email log deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting email log:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete email log",
      },
      { status: 500 }
    );
  }
}
