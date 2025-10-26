import mongoose from 'mongoose';
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/manzxyid';
    cached.promise = mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(m=>m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
