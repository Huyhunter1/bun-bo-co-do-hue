const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "bun_bo_hue_co_do";

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  try {
    const db = client.db(MONGODB_DB_NAME);
    const coupons = db.collection("coupons");

    const now = new Date();
    const fallbackExpiry = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const promosPath = path.join(process.cwd(), "src", "data", "promos.json");
    const promos = JSON.parse(fs.readFileSync(promosPath, "utf-8"));

    const gradientByIndex = [
      "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
      "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
      "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
      "linear-gradient(135deg, #b91c1c 0%, #f97316 100%)",
    ];

    const badgeByIndex = ["Hot", "Uu dai", "Deal", "Moi"];

    await coupons.deleteMany({});

    const docs = promos.map((promo, index) => {
      const rawExpiry = promo.expiryDate ? new Date(promo.expiryDate) : null;
      const validUntil = !rawExpiry || Number.isNaN(rawExpiry.getTime())
        ? fallbackExpiry
        : rawExpiry < now
        ? fallbackExpiry
        : rawExpiry;

      return {
        id: index + 1,
        code: String(promo.code || "").toUpperCase(),
        description: promo.description || null,
        discount_type: promo.discountType === "fixed" ? "fixed" : "percentage",
        discount_value: Number(promo.discountValue || 0),
        min_order_amount: Number(promo.minOrderValue || 0),
        max_discount_amount:
          promo.maxDiscount === undefined || promo.maxDiscount === null
            ? null
            : Number(promo.maxDiscount),
        usage_limit: 500,
        used_count: 0,
        valid_from: now,
        valid_until: validUntil,
        is_active: true,
        show_in_popup: index < 3,
        popup_priority: index + 1,
        popup_badge: badgeByIndex[index] || "Uu dai",
        popup_gradient: gradientByIndex[index % gradientByIndex.length],
        show_in_suggestions: true,
        suggestion_priority: index + 1,
        suggestion_badge: index === 0 ? "Best" : null,
        created_at: now,
        updated_at: now,
      };
    });

    await coupons.insertMany(docs);
    await db
      .collection("counters")
      .updateOne({ _id: "coupons" }, { $set: { seq: docs.length } }, { upsert: true });

    const saved = await coupons
      .find(
        {},
        {
          projection: {
            _id: 0,
            id: 1,
            code: 1,
            discount_type: 1,
            discount_value: 1,
            is_active: 1,
            show_in_popup: 1,
          },
        }
      )
      .sort({ id: 1 })
      .toArray();

    console.log("Reset coupons thanh cong:");
    console.log(JSON.stringify(saved, null, 2));
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Reset coupons that bai:", error);
  process.exit(1);
});
