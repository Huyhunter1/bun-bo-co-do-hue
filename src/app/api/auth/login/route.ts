// src/app/api/auth/login/route.ts - API đăng nhập
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";

function signToken(payload: { id: number; username: string; role: string }) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const jwtExpires = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpires } as SignOptions);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { success: false, error: "Thiếu thông tin đăng nhập" },
      { status: 400 }
    );
  }

  try {
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

    const token = signToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

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
    
    // Try fallback authentication
    try {
      const adminUsername = process.env.ADMIN_USERNAME || "admin";
      const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";

      if (username === adminUsername && password === adminPassword) {
        const fallbackUser = {
          id: 1,
          username: adminUsername,
          role: "admin",
          full_name: process.env.ADMIN_FULL_NAME || "System Admin",
          email: process.env.ADMIN_EMAIL || "admin@bunbohuecodo.vn",
          status: "active",
        };

        const token = signToken({
          id: fallbackUser.id,
          username: fallbackUser.username,
          role: fallbackUser.role,
        });

        return NextResponse.json(
          {
            success: true,
            message: "Đăng nhập thành công (chế độ dự phòng)",
            data: {
              user: fallbackUser,
              token,
            },
            fallback: true,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Tên đăng nhập hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    } catch (fallbackError: any) {
      console.error("Fallback Login Error:", fallbackError);
      return NextResponse.json(
        {
          success: false,
          error: "Lỗi đăng nhập",
          details: error.message || "Database connection failed",
        },
        { status: 503 }
      );
    }
  }
}
