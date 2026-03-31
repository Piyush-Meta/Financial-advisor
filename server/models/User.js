import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, default: 'Lakshmi' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  language: { type: String, default: 'en' },
  role: { type: String, default: 'rural-entrepreneur' },
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.models.User || mongoose.model('User', userSchema)
export default User
