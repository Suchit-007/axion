import mongoose from 'mongoose';

let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maintenance-platform';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Ensure database name is in the connection string
// MongoDB Atlas connection strings sometimes don't include database name
if (MONGODB_URI.includes('mongodb+srv://') || MONGODB_URI.includes('mongodb://')) {
  // Check if database name is missing (connection string ends with / or has ? but no database)
  const hasQueryParams = MONGODB_URI.includes('?');
  const pathMatch = MONGODB_URI.match(/@[^\/]+(\/[^?]*)?(\?|$)/);
  
  if (!pathMatch || !pathMatch[1] || pathMatch[1] === '/') {
    // Database name is missing, add it
    const dbName = 'maintenance-platform';
    if (hasQueryParams) {
      // Insert database name before query params
      MONGODB_URI = MONGODB_URI.replace(/(@[^\/]+)\/?(?=\?)/, `$1/${dbName}`);
    } else {
      // Append database name at the end
      if (MONGODB_URI.endsWith('/')) {
        MONGODB_URI = MONGODB_URI + dbName;
      } else {
        MONGODB_URI = MONGODB_URI + '/' + dbName;
      }
    }
  }
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    try {
      cached.promise = mongoose.connect(MONGODB_URI, opts);
    } catch (error) {
      cached.promise = null;
      console.error('MongoDB connection setup error:', error);
      throw error;
    }
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB connected successfully');
    return cached.conn;
  } catch (error: any) {
    cached.promise = null;
    console.error('MongoDB connection error:', error.message);
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
}

export default connectDB;

