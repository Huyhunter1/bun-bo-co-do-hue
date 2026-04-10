// src/app/api/menu/route.ts - API lấy thực đơn từ database
import { NextRequest, NextResponse } from "next/server";
import { getDb, getNextSequence } from "@/lib/mongodb";
import { syncMenuToJson } from "@/lib/syncMenu";

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const available = searchParams.get("available");

    const filter: Record<string, any> = {};
    if (category) {
      filter.category = category;
    }
    if (featured === "true") {
      filter.is_featured = true;
    }
    if (available !== "false") {
      filter.is_available = true;
    }

    const items = await db
      .collection("menu_items")
      .find(filter)
      .sort({ is_featured: -1, sold_count: -1, name: 1 })
      .project({
        _id: 0,
        id: 1,
        name: 1,
        description: 1,
        price: 1,
        category: 1,
        image: "$image_url",
        popular: "$is_featured",
        spicy_level: { $literal: 0 },
        available: "$is_available",
      })
      .toArray();

    return NextResponse.json({
      success: true,
      data: items,
      count: Array.isArray(items) ? items.length : 0,
    });
  } catch (error: any) {
    console.error("Menu API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể tải thực đơn",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Thêm món mới (Admin only)
export async function POST(request: NextRequest) {
  try {
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

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const nextId = await getNextSequence("menu_items");

    await db.collection("menu_items").insertOne({
      id: nextId,
      name,
      slug,
      description,
      price,
      category,
      image_url: image || null,
      is_available: available ?? true,
      is_featured: popular ?? false,
      preparation_time: 15,
      sold_count: 0,
      is_spicy: Boolean(spicy_level && spicy_level > 0),
      rating: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Sync to menu.json for homepage
    await syncMenuToJson();

    return NextResponse.json({
      success: true,
      message: "Thêm món thành công",
      data: { id: nextId },
    });
  } catch (error: any) {
    console.error("Menu POST Error:", error);
    return NextResponse.json(
      { success: false, error: "Không thể thêm món", details: error.message },
      { status: 500 }
    );
  }
}
