import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema({
  _id: { type: Number },
  nombre: { type: String, required: true },
  poder: { type: String, required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
});

const Hero = mongoose.model('Hero', heroSchema);
export default Hero;