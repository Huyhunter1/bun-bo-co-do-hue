import dns from "dns";
import { Db, MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "bun_bo_hue_co_do";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
const MONGODB_DNS_SERVERS = (process.env.MONGODB_DNS_SERVERS || "8.8.8.8,1.1.1.1")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);

if (IS_DEVELOPMENT && MONGODB_URI.startsWith("mongodb+srv://")) {
  if (MONGODB_DNS_SERVERS.length > 0) {
    dns.setServers(MONGODB_DNS_SERVERS);
  }
}

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | undefined;

async function getResolvedMongoUri(): Promise<string> {
  if (!MONGODB_URI.startsWith("mongodb+srv://") || !IS_DEVELOPMENT) {
    return MONGODB_URI;
  }

  try {
    const parsed = new URL(MONGODB_URI);
    const resolver = new dns.promises.Resolver();

    if (MONGODB_DNS_SERVERS.length > 0) {
      resolver.setServers(MONGODB_DNS_SERVERS);
    }

    const srvRecords = await resolver.resolveSrv(`_mongodb._tcp.${parsed.hostname}`);
    const txtRecords = await resolver.resolveTxt(parsed.hostname).catch(() => [] as string[][]);

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

async function connectMongoClient(): Promise<MongoClient> {
  const resolvedUri = await getResolvedMongoUri();
  const client = new MongoClient(resolvedUri, {
    retryReads: true,
    retryWrites: true,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    maxPoolSize: 10,
    maxIdleTimeMS: 30000,
    waitQueueTimeoutMS: 3000,
  });
  return client.connect();
}

function resetClientPromise() {
  if (IS_DEVELOPMENT) {
    global.__mongoClientPromise = undefined;
  }
  clientPromise = undefined;
}

function getClientPromise() {
  if (IS_DEVELOPMENT) {
    if (!global.__mongoClientPromise) {
      global.__mongoClientPromise = connectMongoClient().catch((error) => {
        resetClientPromise();
        throw error;
      });
    }

    return global.__mongoClientPromise;
  }

  if (!clientPromise) {
    clientPromise = connectMongoClient().catch((error) => {
      resetClientPromise();
      throw error;
    });
  }

  return clientPromise;
}

function isTransientMongoError(error: unknown): boolean {
  const message = String((error as any)?.message || "").toLowerCase();
  const code = String((error as any)?.code || "").toLowerCase();
  const causeCode = String((error as any)?.cause?.code || "").toLowerCase();
  const name = String((error as any)?.name || "").toLowerCase();

  return (
    name.includes("mongonetworkerror") ||
    message.includes("ssl") ||
    message.includes("tls") ||
    message.includes("connection") ||
    code.includes("econnreset") ||
    code.includes("etimedout") ||
    causeCode.includes("err_ssl") ||
    causeCode.includes("econnreset")
  );
}

export async function getDb(): Promise<Db> {
  try {
    const client = await getClientPromise();
    return client.db(MONGODB_DB_NAME);
  } catch (error) {
    if (!isTransientMongoError(error)) {
      throw error;
    }

    resetClientPromise();
    const client = await getClientPromise();
    return client.db(MONGODB_DB_NAME);
  }
}

export async function getNextSequence(sequenceName: string): Promise<number> {
  const db = await getDb();
  const counters = db.collection<{ _id: string; seq: number }>("counters");
  const result = await counters.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  return result?.seq ?? 1;
}

export function toNumberId(rawId: string): number {
  const id = Number.parseInt(rawId, 10);
  if (Number.isNaN(id)) {
    throw new Error("Invalid numeric id");
  }
  return id;
}
