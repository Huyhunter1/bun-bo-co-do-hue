const { MongoClient } = require("mongodb");

const SOURCE_URI = process.env.SOURCE_MONGODB_URI || "mongodb://127.0.0.1:27017";
const TARGET_URI = process.env.TARGET_MONGODB_URI || process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || "bun_bo_hue_co_do";

if (!TARGET_URI) {
  console.error("Missing TARGET_MONGODB_URI or MONGODB_URI");
  process.exit(1);
}

async function main() {
  const sourceClient = new MongoClient(SOURCE_URI);
  const targetClient = new MongoClient(TARGET_URI);

  await sourceClient.connect();
  await targetClient.connect();

  try {
    const sourceDb = sourceClient.db(DB_NAME);
    const targetDb = targetClient.db(DB_NAME);

    const collections = await sourceDb.listCollections({}, { nameOnly: true }).toArray();

    const report = [];

    for (const col of collections) {
      const name = col.name;
      const sourceCol = sourceDb.collection(name);
      const targetCol = targetDb.collection(name);

      const docs = await sourceCol.find({}).toArray();

      await targetCol.deleteMany({});

      if (docs.length > 0) {
        await targetCol.insertMany(docs, { ordered: false });
      }

      report.push({ collection: name, copied: docs.length });
    }

    console.log(JSON.stringify({ db: DB_NAME, collections: report }, null, 2));
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
