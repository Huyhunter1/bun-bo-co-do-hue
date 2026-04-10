// src/app/api/customers/route.ts - API quản lý khách hàng
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const type = searchParams.get("type") || "all"; // all, new, returning, vip

    const [orders, reservations] = await Promise.all([
      db
        .collection("orders")
        .find(
          {},
          {
            projection: {
              _id: 0,
              id: 1,
              customer_name: 1,
              customer_phone: 1,
              customer_email: 1,
              delivery_address: 1,
              total_amount: 1,
              created_at: 1,
            },
          }
        )
        .toArray(),
      db
        .collection("reservations")
        .find(
          {},
          {
            projection: {
              _id: 0,
              id: 1,
              customer_name: 1,
              customer_phone: 1,
              customer_email: 1,
              created_at: 1,
            },
          }
        )
        .toArray(),
    ]);

    const map = new Map<string, any>();

    for (const order of orders) {
      const phone = order.customer_phone;
      if (!phone) continue;
      const current = map.get(phone) || {
        phone,
        name: order.customer_name || "",
        email: order.customer_email || "",
        address: order.delivery_address || "",
        total_orders: 0,
        total_reservations: 0,
        total_spent: 0,
        first_visit: order.created_at,
        last_visit: order.created_at,
      };

      current.name = current.name || order.customer_name || "";
      current.email = current.email || order.customer_email || "";
      current.address = current.address || order.delivery_address || "";
      current.total_orders += 1;
      current.total_spent += Number(order.total_amount || 0);
      current.first_visit =
        new Date(current.first_visit) < new Date(order.created_at)
          ? current.first_visit
          : order.created_at;
      current.last_visit =
        new Date(current.last_visit) > new Date(order.created_at)
          ? current.last_visit
          : order.created_at;
      map.set(phone, current);
    }

    for (const reservation of reservations) {
      const phone = reservation.customer_phone;
      if (!phone) continue;
      const current = map.get(phone) || {
        phone,
        name: reservation.customer_name || "",
        email: reservation.customer_email || "",
        address: "",
        total_orders: 0,
        total_reservations: 0,
        total_spent: 0,
        first_visit: reservation.created_at,
        last_visit: reservation.created_at,
      };

      current.name = current.name || reservation.customer_name || "";
      current.email = current.email || reservation.customer_email || "";
      current.total_reservations += 1;
      current.first_visit =
        new Date(current.first_visit) < new Date(reservation.created_at)
          ? current.first_visit
          : reservation.created_at;
      current.last_visit =
        new Date(current.last_visit) > new Date(reservation.created_at)
          ? current.last_visit
          : reservation.created_at;
      map.set(phone, current);
    }

    let customers = Array.from(map.values());
    const allCustomers = customers;

    if (search) {
      const needle = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          String(c.name || "")?.toLowerCase().includes(needle) ||
          String(c.phone || "")?.toLowerCase().includes(needle) ||
          String(c.email || "")?.toLowerCase().includes(needle)
      );
    }

    if (type === "new") {
      customers = customers.filter((c) => c.total_orders <= 1);
    } else if (type === "returning") {
      customers = customers.filter(
        (c) => c.total_orders >= 2 && Number(c.total_spent) < 1000000
      );
    } else if (type === "vip") {
      customers = customers.filter(
        (c) => Number(c.total_spent) >= 1000000 || c.total_orders >= 5
      );
    }

    customers.sort(
      (a, b) =>
        Number(b.total_spent || 0) - Number(a.total_spent || 0) ||
        new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime()
    );

    const stats = {
      total: allCustomers.length,
      new: allCustomers.filter((c: any) => c.total_orders <= 1).length,
      returning: allCustomers.filter(
        (c: any) => c.total_orders >= 2 && Number(c.total_spent) < 1000000
      ).length,
      vip: allCustomers.filter(
        (c: any) => Number(c.total_spent) >= 1000000 || c.total_orders >= 5
      ).length,
      totalRevenue: allCustomers.reduce(
        (sum: number, c: any) => sum + Number(c.total_spent),
        0
      ),
    };

    return NextResponse.json({
      success: true,
      data: customers,
      stats: stats,
    });
  } catch (error: any) {
    console.error("Customers GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể tải danh sách khách hàng",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
