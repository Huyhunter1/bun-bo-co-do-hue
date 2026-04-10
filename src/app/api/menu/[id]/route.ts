// src/app/api/menu/[id]/route.ts - API chi tiết món ăn
import { NextRequest, NextResponse } from "next/server";
import { getDb, toNumberId } from "@/lib/mongodb";
import { syncMenuToJson } from "@/lib/syncMenu";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = toNumberId(params.id);
    const db = await getDb();
    const item = await db.collection("menu_items").findOne({ id }, { projection: { _id: 0 } });

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy món ăn" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    console.error("Menu Item API Error:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tải món ăn", details: error.message },
      { status: 500 }
    );
  }
}

// Cập nhật món (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = toNumberId(params.id);
    const db = await getDb();
    const body = await request.json();
    const {
      name,
      description,
      price,
      category,
      image,
      popular,
      spicy_level,
      available,
    } = body;

    await db.collection("menu_items").updateOne(
      { id },
      {
        $set: {
          name,
          description,
          price,
          category,
          image_url: image || null,
          is_available: available ?? true,
          is_featured: popular ?? false,
          updated_at: new Date(),
        },
      }
    );

    // Sync to menu.json for homepage
    await syncMenuToJson();

    return NextResponse.json({
      success: true,
      message: "Cập nhật món thành công",
    });
  } catch (error: any) {
    console.error("Menu PUT Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể cập nhật món",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Xóa món (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = toNumberId(params.id);
    const db = await getDb();
    await db.collection("menu_items").deleteOne({ id });

    // Sync to menu.json for homepage
    await syncMenuToJson();

    return NextResponse.json({
      success: true,
      message: "Xóa món thành công",
    });
  } catch (error: any) {
    console.error("Menu DELETE Error:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa món", details: error.message },
      { status: 500 }
    );
  }
}
