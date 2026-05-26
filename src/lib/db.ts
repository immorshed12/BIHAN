
import mongoose from 'mongoose';
import dns from 'dns';

// Configure public DNS resolvers to bypass local ISP SRV lookup blocks
try {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
} catch (dnsErr: any) {
  console.warn('[DB] Failed to set custom DNS fallback:', dnsErr.message);
}

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and serverless function instances in production.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached!.conn && mongoose.connection.readyState === 1) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    // Optimization parameters tailored for MongoDB Atlas M0 (Free Tier) in a Serverless Environment:
    // 1. maxPoolSize: 2 (Limit connection pool size per lambdas to prevent hitting Atlas 500-conn ceiling).
    // 2. serverSelectionTimeoutMS: 5000 (Fail-fast in serverless functions to avoid costly run-time timeouts).
    // 3. socketTimeoutMS: 45000 (Keep-alive config optimal for free tier network performance).
    const opts = {
      bufferCommands: false,
      maxPoolSize: 5,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 15000, // 15 seconds to survive ISP network lag
      socketTimeoutMS: 60000,
      connectTimeoutMS: 15000,
    };

    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((m) => {
      return m;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default dbConnect;
