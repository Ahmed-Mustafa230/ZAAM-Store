import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

function getConnectionOptions() {
  return {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 10000,
    socketTimeoutMS: 45000,
  };
}

function setupConnectionHandlers() {
  mongoose.connection.on('connecting', () => {
    console.log('[MongoDB] Connecting...');
  });

  mongoose.connection.on('connected', () => {
    console.log('[MongoDB] Connected');
  });

  mongoose.connection.on('disconnecting', () => {
    console.log('[MongoDB] Disconnecting...');
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] Reconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Connection error:', err.message);
  });

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error(
      'MongoDB connection string is missing. Define MONGODB_URI in your .env.local file.\n' +
      'Example: MONGODB_URI=mongodb://localhost:27017/zaam-store'
    );
  }

  setupConnectionHandlers();

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, getConnectionOptions()).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error: unknown) {
    cached.promise = null;
    const msg = error instanceof Error ? error.message : String(error);

    if (msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND') || msg.includes('timed out')) {
      throw new Error(
        `Cannot reach MongoDB at ${MONGODB_URI}.\n` +
        'Make sure MongoDB is running:\n' +
        '  - Windows: Start-Service MongoDB  (or run: mongod)\n' +
        '  - macOS:   brew services start mongodb-community\n' +
        '  - Linux:   sudo systemctl start mongod'
      );
    }

    throw new Error(`MongoDB connection failed: ${msg}`);
  }

  return cached.conn;
}

export default connectDB;
