// API để xóa nhiều món ăn cùng lúc
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { syncMenuToJson } from "@/lib/syncMenu";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Danh sách ID không hợp lệ" },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Xóa các món ăn
    const result = await db.collection("menu_items").deleteMany({
      id: { $in: ids }
    });

    // Sync lại menu.json
    await syncMenuToJson();

    return NextResponse.json({
      success: true,
      message: `Xóa ${result.deletedCount} món ăn thành công`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error("Menu Bulk Delete Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể xóa các món ăn",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
