import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Không có file được tải lên" },
        { status: 400 }
      );
    }

    // Kiểm tra loại file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Chỉ hỗ trợ các định dạng: JPG, PNG, WebP, GIF",
        },
        { status: 400 }
      );
    }

    // Kiểm tra kích thước (tối đa 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "Kích thước file vượt quá 5MB",
        },
        { status: 400 }
      );
    }

    // Chuyển file thành base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      data: {
        image: dataUrl,
        fileName: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Lỗi khi tải ảnh",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
