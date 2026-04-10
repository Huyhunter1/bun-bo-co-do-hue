const { MongoClient } = require("mongodb");

const BASE_URL = "http://localhost:3000";
const URI = "mongodb://127.0.0.1:27017";
const DB_NAME = "bun_bo_hue_co_do";
const TEST_RECIPIENT = process.env.TEST_RECIPIENT || "test@example.com";

async function nextSeq(db, name) {
  const result = await db
    .collection("counters")
    .findOneAndUpdate(
      { _id: name },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );
  return result.seq;
}

async function main() {
  const client = new MongoClient(URI);
  await client.connect();

  try {
    const db = client.db(DB_NAME);
    const now = new Date();

    await db.collection("orders").deleteMany({ order_number: /^TEST-NOTI-/ });
    await db.collection("order_items").deleteMany({ item_name: "Bun bo test" });
    await db
      .collection("reservations")
      .deleteMany({ reservation_number: /^TEST-RES-/ });

    const orderId = await nextSeq(db, "orders");
    const orderNumber = `TEST-NOTI-${orderId}`;
    await db.collection("orders").insertOne({
      id: orderId,
      order_number: orderNumber,
      customer_name: "Test User",
      customer_phone: "0901234567",
      customer_email: TEST_RECIPIENT,
      delivery_address: "Hue",
      order_type: "delivery",
      subtotal: 50000,
      discount_amount: 0,
      delivery_fee: 0,
      total_amount: 50000,
      payment_method: "cash",
      payment_status: "pending",
      order_status: "pending",
      email_sent: false,
      email_count: 0,
      created_at: now,
      updated_at: now,
    });

    const itemId = await nextSeq(db, "order_items");
    await db.collection("order_items").insertOne({
      id: itemId,
      order_id: orderId,
      menu_item_id: 1,
      item_name: "Bun bo test",
      item_price: 50000,
      quantity: 1,
      toppings: null,
      subtotal: 50000,
      notes: null,
      created_at: now,
    });

    const reservationId = await nextSeq(db, "reservations");
    const reservationNumber = `TEST-RES-${reservationId}`;
    await db.collection("reservations").insertOne({
      id: reservationId,
      reservation_number: reservationNumber,
      customer_name: "Test User",
      customer_phone: "0901234567",
      customer_email: TEST_RECIPIENT,
      reservation_date: "2026-04-20",
      reservation_time: "18:00",
      number_of_guests: 2,
      special_requests: null,
      status: "confirmed",
      table_number: null,
      created_at: now,
      updated_at: now,
    });

    const [smsRes, orderEmailRes, reservationEmailRes] = await Promise.all([
      fetch(`${BASE_URL}/api/orders/${orderId}/send-sms`, { method: "POST" }),
      fetch(`${BASE_URL}/api/orders/${orderId}/send-email`, { method: "POST" }),
      fetch(`${BASE_URL}/api/reservations/${reservationId}/send-email`, {
        method: "POST",
      }),
    ]);

    const smsData = await smsRes.json();
    const orderEmailData = await orderEmailRes.json();
    const reservationEmailData = await reservationEmailRes.json();

    const [smsLog, emailLogs] = await Promise.all([
      db
        .collection("sms_logs")
        .find({ order_id: orderId }, { projection: { _id: 0 } })
        .sort({ sent_at: -1 })
        .limit(1)
        .toArray(),
      db
        .collection("email_logs")
        .find(
          {
            $or: [{ order_id: orderId }, { reservation_id: reservationId }],
          },
          { projection: { _id: 0 } }
        )
        .sort({ sent_at: -1 })
        .toArray(),
    ]);

    console.log(
      JSON.stringify(
        {
          testIds: { orderId, reservationId, orderNumber, reservationNumber },
          testRecipient: TEST_RECIPIENT,
          responses: {
            sms: { status: smsRes.status, body: smsData },
            orderEmail: { status: orderEmailRes.status, body: orderEmailData },
            reservationEmail: {
              status: reservationEmailRes.status,
              body: reservationEmailData,
            },
          },
          logSnapshot: {
            latestSmsLog: smsLog[0] || null,
            emailLogCount: emailLogs.length,
            latestEmailLog: emailLogs[0] || null,
          },
        },
        null,
        2
      )
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
