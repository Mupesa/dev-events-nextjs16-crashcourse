import mongoose, { type Mongoose } from "mongoose";

type MongooseCache = {
  connection: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

// Persist the cache across module reloads triggered by Next.js development mode.
const globalWithMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache = globalWithMongoose.mongooseCache ?? {
  connection: null,
  promise: null,
};

globalWithMongoose.mongooseCache = cache;

/** Returns a reusable Mongoose connection for server-side database operations. */
export async function connectToDatabase(): Promise<Mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI?.trim();

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable.");
  }

  if (cache.connection) {
    return cache.connection;
  }

  // Cache the pending promise so concurrent requests share one connection attempt.
  cache.promise ??= mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });

  try {
    cache.connection = await cache.promise;
  } catch (error: unknown) {
    // Allow a later request to retry after a transient connection failure.
    cache.promise = null;
    throw error;
  }

  return cache.connection;
}

export default connectToDatabase;
