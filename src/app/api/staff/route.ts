import { NextRequest, NextResponse } from "next/server";
import { getDb, getNextSequence } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const db = await getDb();
    const staff = await db
      .collection("users")
      .find(
        {},
        {
          projection: {
            _id: 0,
            id: 1,
            username: 1,
            full_name: 1,
            email: 1,
            phone: 1,
            role: 1,
            status: 1,
            created_at: 1,
          },
        }
      )
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: staff,
    });
  } catch (error: any) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch staff",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { username, password, role, full_name, email, phone } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Username and password are required",
        },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await db.collection("users").findOne({ username });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Username already exists",
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set default values for required fields
    const staffFullName = full_name || username;
    const staffEmail = email || `${username}@bunbohuecodo.vn`;
    const staffRole = role || "staff";

    // Insert new staff member
    const nextId = await getNextSequence("users");
    await db.collection("users").insertOne({
      id: nextId,
      username,
      password: hashedPassword,
      full_name: staffFullName,
      email: staffEmail,
      phone: phone || null,
      role: staffRole,
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Staff member added successfully",
      data: {
        id: nextId,
        username,
        full_name: staffFullName,
        email: staffEmail,
        role: staffRole,
      },
    });
  } catch (error: any) {
    console.error("Error adding staff:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add staff member",
      },
      { status: 500 }
    );
  }
}
