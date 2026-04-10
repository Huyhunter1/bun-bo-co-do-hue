// src/app/api/auth/login/route.ts - API đăng nhập
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin đăng nhập" },
        { status: 400 }
      );
    }

    // Tìm user
    const db = await getDb();
    const user = await db
      .collection("users")
      .findOne<any>({ username, status: "active" });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Tên đăng nhập không tồn tại" },
        { status: 401 }
      );
    }

    // Kiểm tra password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu không đúng" },
        { status: 401 }
      );
    }

    // Tạo JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }
    const jwtExpires = process.env.JWT_EXPIRES_IN || "7d";

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: jwtExpires } as SignOptions
    );

    // Trả về thông tin user (không bao gồm password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi đăng nhập", details: error.message },
      { status: 500 }
    );
  }
}
