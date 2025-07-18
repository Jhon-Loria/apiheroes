import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: { type: Number },
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);
export default User; 