import { NextRequest, NextResponse } from "next/server";
import { getDb, toNumberId } from "@/lib/mongodb";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = toNumberId(params.id);
    const db = await getDb();
    const body = await request.json();
    const { role, full_name, email, phone, status } = body;

    // Check if staff member exists
    const staff = await db
      .collection("users")
      .findOne<{ id: number; role: string }>({ id }, { projection: { id: 1, role: 1 } });

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          error: "Staff member not found",
        },
        { status: 404 }
      );
    }

    const updates: Record<string, any> = {};

    if (role !== undefined) {
      updates.role = role;
    }
    if (full_name !== undefined) {
      updates.full_name = full_name;
    }
    if (email !== undefined) {
      updates.email = email;
    }
    if (phone !== undefined) {
      updates.phone = phone;
    }
    if (status !== undefined) {
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No fields to update",
        },
        { status: 400 }
      );
    }

    updates.updated_at = new Date();

    // Update staff member
    await db.collection("users").updateOne({ id }, { $set: updates });

    return NextResponse.json({
      success: true,
      message: "Staff member updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update staff member",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = toNumberId(params.id);
    const db = await getDb();

    // Check if staff member exists and is not an admin
    const staff = await db
      .collection("users")
      .findOne<{ role: string }>({ id }, { projection: { role: 1 } });

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          error: "Staff member not found",
        },
        { status: 404 }
      );
    }

    if (staff.role === "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete admin account",
        },
        { status: 403 }
      );
    }

    // Delete staff member
    await db.collection("users").deleteOne({ id });

    return NextResponse.json({
      success: true,
      message: "Staff member deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting staff:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete staff member",
      },
      { status: 500 }
    );
  }
}
