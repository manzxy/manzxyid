import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
  uid: { type: String, unique: true, required: true },
  provider: String,
  name: String,
  email: String,
  picture: String,
  password: String,
  commentsCount: { type: Number, default: 0 },
  title: { type: String, default: '🐣 Pembaca Baru' },
  role: { type: String, default: 'user' },
  warnings: { type: Number, default: 0 },
  isBanned: { type: Boolean, default: false },
  banExpires: { type: Date, default: null },
  lastLoginIP: String,
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.models.User || mongoose.model('User', UserSchema);
