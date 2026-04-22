import { Db, MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "bun_bo_hue_co_do";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | undefined;

async function connectMongoClient(): Promise<MongoClient> {
  // During build time (Vercel static generation), use shorter timeouts for faster failure
  const isBuildTime = process.env.__NEXT_PRIVATE_BUILD_ID !== undefined;
  const baseTimeout = isBuildTime ? 2000 : 8000;
  
  // Use only valid MongoDB driver options
  const connectionOptions: any = {
    serverSelectionTimeoutMS: baseTimeout,
    socketTimeoutMS: isBuildTime ? 3000 : 15000,
    retryReads: !isBuildTime,
    retryWrites: !isBuildTime,
    maxPoolSize: isBuildTime ? 5 : 15,
    minPoolSize: 2,
    maxIdleTimeMS: 45000,
  };
  
  const client = new MongoClient(MONGODB_URI, connectionOptions);
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
  const reason = String((error as any)?.reason || "").toLowerCase();

  // Transient network errors
  const isNetworkError =
    name.includes("mongonetworkerror") ||
    name.includes("replicasetnoprimary") ||
    code.includes("econnreset") ||
    code.includes("etimedout") ||
    code.includes("econnrefused") ||
    reason.includes("no suitable servers");

  // SSL/TLS errors (usually recoverable by reconnecting)
  const isSSLError =
    message.includes("ssl") ||
    message.includes("tls") ||
    message.includes("certificate") ||
    code.includes("err_ssl") ||
    causeCode.includes("err_ssl") ||
    message.includes("alert");

  // Connection errors
  const isConnectionError =
    message.includes("connection") ||
    message.includes("timeout") ||
    message.includes("server");

  return isNetworkError || isSSLError || isConnectionError;
}

export async function getDb(): Promise<Db> {
  let lastError: unknown;
  
  // Try up to 2 times with fresh connection on SSL errors
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const client = await getClientPromise();
      
      // Quick health check
      if (attempt === 1) {
        try {
          await client.db("admin").command({ ping: 1 });
        } catch (e) {
          console.warn(`⚠️ Ping failed (attempt ${attempt}), resetting connection...`);
          resetClientPromise();
          lastError = e;
          if (attempt === 1) continue; // Try again
          throw e;
        }
      }
      
      return client.db(MONGODB_DB_NAME);
    } catch (error) {
      lastError = error;
      
      if (!isTransientMongoError(error)) {
        throw error;
      }

      if (attempt === 1) {
        console.warn(`🔄 Transient error (attempt ${attempt}), reconnecting...`);
        resetClientPromise();
      }
    }
  }
  
  throw lastError || new Error("Failed to connect to MongoDB after retries");
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

// Health check function for diagnostics
export async function checkMongoDBHealth(): Promise<{
  connected: boolean;
  latency: number;
  error?: string;
}> {
  const startTime = Date.now();
  try {
    const client = await getClientPromise();
    await client.db("admin").command({ ping: 1 });
    return {
      connected: true,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      connected: false,
      latency: Date.now() - startTime,
      error: String((error as any)?.message || "Unknown error"),
    };
  }
}
