// src/lib/syncMenu.ts - Sync menu data from DB to JSON file
import { getDb } from "./mongodb";
import fs from "fs/promises";
import path from "path";

export async function syncMenuToJson() {
  try {
    console.log("🔄 Syncing menu from database to menu.json...");
    const db = await getDb();

    // Fetch all menu items from database
    const items = await db
      .collection("menu_items")
      .find({}, { projection: { _id: 0 } })
      .sort({ category: 1, name: 1 })
      .toArray();

    // Transform to match JSON structure
    const menuData = Array.isArray(items)
      ? items.map((item: any) => ({
          id: item.slug || item.id.toString(),
          name: item.name,
          description: item.description,
          price: parseFloat(item.price),
          category: item.category,
          image: item.image_url || `/images/${item.slug}.jpg`,
          popular: Boolean(item.is_featured),
          spicyLevel: item.is_spicy ? 5 : 0,
          available: Boolean(item.is_available),
        }))
      : [];

    // Write to menu.json
    const menuFilePath = path.join(process.cwd(), "src", "data", "menu.json");
    await fs.writeFile(
      menuFilePath,
      JSON.stringify(menuData, null, 2),
      "utf-8"
    );

    console.log(`✅ Synced ${menuData.length} menu items to menu.json`);
    return { success: true, count: menuData.length };
  } catch (error) {
    console.error("❌ Error syncing menu:", error);
    throw error;
  }
}
