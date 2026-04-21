const fs = require("fs");
const path = require("path");
const dns = require("dns");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: path.join(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "bun_bo_hue_co_do";
const MONGODB_DNS_SERVERS = (process.env.MONGODB_DNS_SERVERS || "8.8.8.8,1.1.1.1")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@12345";
const ADMIN_FULL_NAME = process.env.ADMIN_FULL_NAME || "System Admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@bunbohuecodo.vn";

if (MONGODB_URI.startsWith("mongodb+srv://") && MONGODB_DNS_SERVERS.length > 0) {
  dns.setServers(MONGODB_DNS_SERVERS);
}

async function getResolvedMongoUri() {
  if (!MONGODB_URI.startsWith("mongodb+srv://")) {
    return MONGODB_URI;
  }

  try {
    const parsed = new URL(MONGODB_URI);
    const resolver = new dns.promises.Resolver();

    if (MONGODB_DNS_SERVERS.length > 0) {
      resolver.setServers(MONGODB_DNS_SERVERS);
    }

    const srvRecords = await resolver.resolveSrv(`_mongodb._tcp.${parsed.hostname}`);
    const txtRecords = await resolver.resolveTxt(parsed.hostname).catch(() => []);

    const hosts = srvRecords.map((record) => `${record.name}:${record.port}`).join(",");
    const params = new URLSearchParams(parsed.search);

    for (const record of txtRecords) {
      const txt = record.join("");
      const txtParams = new URLSearchParams(txt);
      txtParams.forEach((value, key) => {
        if (!params.has(key)) {
          params.set(key, value);
        }
      });
    }

    if (!params.has("tls")) {
      params.set("tls", "true");
    }

    const username = encodeURIComponent(parsed.username);
    const password = encodeURIComponent(parsed.password);
    const auth = username ? `${username}:${password}@` : "";
    const dbPath = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "";

    return `mongodb://${auth}${hosts}${dbPath}?${params.toString()}`;
  } catch {
    return MONGODB_URI;
  }
}

function readJson(relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  return JSON.parse(fs.readFileSync(fullPath, "utf-8"));
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getPopupGradient(index) {
  return index % 2 === 0
    ? "linear-gradient(135deg, #ef4444 0%, #f97316 100%)"
    : "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)";
}

async function getMaxId(collection) {
  const last = await collection.find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
  return last[0]?.id || 0;
}

async function ensureCounters(db, sequenceName, value) {
  await db.collection("counters").updateOne(
    { _id: sequenceName },
    { $max: { seq: value } },
    { upsert: true }
  );
}

async function seedMenu(db) {
  const menuCol = db.collection("menu_items");
  const menu = readJson(path.join("src", "data", "menu.json"));
  const existing = await menuCol.find({}, { projection: { id: 1, slug: 1 } }).toArray();
  const slugToId = new Map(existing.map((x) => [x.slug, x.id]));
  let nextId = await getMaxId(menuCol);

  for (const item of menu) {
    const slug = slugify(item.id || item.name);
    const id = slugToId.get(slug) || ++nextId;
    await menuCol.updateOne(
      { slug },
      {
        $set: {
          id,
          slug,
          name: item.name,
          description: item.description,
          price: Number(item.price || 0),
          category: item.category,
          image_url: item.image || null,
          is_featured: Boolean(item.popular),
          is_spicy: Number(item.spicyLevel || 0) > 0,
          is_available: item.available !== false,
          sold_count: 0,
          rating: 0,
          updated_at: new Date(),
        },
        $setOnInsert: {
          created_at: new Date(),
        },
      },
      { upsert: true }
    );
  }

  await ensureCounters(db, "menu_items", nextId);
  return menu.length;
}

async function seedCombos(db) {
  const comboCol = db.collection("combos");
  const combos = readJson(path.join("src", "data", "combos.json"));
  const existing = await comboCol.find({}, { projection: { id: 1, code: 1 } }).toArray();
  const codeToId = new Map(existing.map((x) => [x.code, x.id]));
  let nextId = await getMaxId(comboCol);

  for (const combo of combos) {
    const code = slugify(combo.id || combo.name);
    const id = codeToId.get(code) || ++nextId;
    await comboCol.updateOne(
      { code },
      {
        $set: {
          id,
          code,
          name: combo.name,
          description: combo.description,
          items: combo.items || [],
          original_price: Number(combo.originalPrice || 0),
          discount_price: Number(combo.discountPrice || 0),
          image_url: combo.image || null,
          is_active: true,
          updated_at: new Date(),
        },
        $setOnInsert: {
          created_at: new Date(),
        },
      },
      { upsert: true }
    );
  }

  await ensureCounters(db, "combos", nextId);
  return combos.length;
}

async function seedCoupons(db) {
  const couponCol = db.collection("coupons");
  const promos = readJson(path.join("src", "data", "promos.json"));
  const existing = await couponCol.find({}, { projection: { id: 1, code: 1 } }).toArray();
  const codeToId = new Map(existing.map((x) => [x.code, x.id]));
  let nextId = await getMaxId(couponCol);
  const now = new Date();
  const fallbackExpiry = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const gradientByIndex = [
    "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
    "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
    "linear-gradient(135deg, #b91c1c 0%, #f97316 100%)",
  ];
  const badgeByIndex = ["Hot", "Uu dai", "Deal", "Moi"];

  for (let i = 0; i < promos.length; i += 1) {
    const promo = promos[i];
    const code = String(promo.code || "").toUpperCase();
    const id = codeToId.get(code) || ++nextId;
    const rawExpiry = promo.expiryDate ? new Date(promo.expiryDate) : null;
    const validUntil = !rawExpiry || Number.isNaN(rawExpiry.getTime())
      ? fallbackExpiry
      : rawExpiry < now
      ? fallbackExpiry
      : rawExpiry;

    await couponCol.updateOne(
      { code },
      {
        $set: {
          id,
          code,
          description: promo.description || null,
          discount_type: promo.discountType === "fixed" ? "fixed" : "percentage",
          discount_value: Number(promo.discountValue || 0),
          min_order_amount: Number(promo.minOrderValue || 0),
          max_discount_amount: promo.maxDiscount ? Number(promo.maxDiscount) : null,
          usage_limit: 500,
          used_count: 0,
          valid_from: now,
          valid_until: validUntil,
          is_active: true,
          show_in_popup: i < 3,
          popup_priority: i + 1,
          popup_badge: badgeByIndex[i] || "Uu dai",
          popup_gradient: gradientByIndex[i % gradientByIndex.length],
          show_in_suggestions: i < 4,
          suggestion_priority: i + 1,
          suggestion_badge: i === 0 ? "Best" : null,
          updated_at: new Date(),
        },
        $setOnInsert: {
          created_at: new Date(),
        },
      },
      { upsert: true }
    );
  }

  await ensureCounters(db, "coupons", nextId);
  return promos.length;
}

async function seedAdmin(db) {
  const userCol = db.collection("users");
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const existingAdmin = await userCol.findOne({ username: ADMIN_USERNAME });
  let adminId = existingAdmin?.id;

  if (!adminId) {
    adminId = (await getMaxId(userCol)) + 1;
  }

  await userCol.updateOne(
    { username: ADMIN_USERNAME },
    {
      $set: {
        id: adminId,
        username: ADMIN_USERNAME,
        password: hashedPassword,
        full_name: ADMIN_FULL_NAME,
        email: ADMIN_EMAIL,
        phone: null,
        role: "admin",
        status: "active",
        updated_at: new Date(),
      },
      $setOnInsert: {
        created_at: new Date(),
      },
    },
    { upsert: true }
  );

  await ensureCounters(db, "users", adminId);
  return { username: ADMIN_USERNAME, password: ADMIN_PASSWORD };
}

async function main() {
  const resolvedUri = await getResolvedMongoUri();
  const client = new MongoClient(resolvedUri);
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    await db.createCollection("users").catch(() => {});
    await db.createCollection("menu_items").catch(() => {});
    await db.createCollection("coupons").catch(() => {});
    await db.createCollection("combos").catch(() => {});
    await db.createCollection("counters").catch(() => {});

    const [menuCount, comboCount, couponCount, adminInfo] = await Promise.all([
      seedMenu(db),
      seedCombos(db),
      seedCoupons(db),
      seedAdmin(db),
    ]);

    await db.collection("users").createIndex({ username: 1 }, { unique: true });
    await db.collection("menu_items").createIndex({ slug: 1 }, { unique: true });
    await db.collection("coupons").createIndex({ code: 1 }, { unique: true });

    console.log("\nSeed MongoDB thành công:");
    console.log(`- Database: ${MONGODB_DB_NAME}`);
    console.log(`- Menu items: ${menuCount}`);
    console.log(`- Combos: ${comboCount}`);
    console.log(`- Coupons: ${couponCount}`);
    console.log(`- Admin username: ${adminInfo.username}`);
    console.log(`- Admin password: ${adminInfo.password}`);
    console.log("\nLưu ý: Hãy đổi mật khẩu admin sau khi đăng nhập lần đầu.");
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Seed MongoDB thất bại:", error);
  process.exit(1);
});
