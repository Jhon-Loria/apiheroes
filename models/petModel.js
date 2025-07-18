import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
  _id: { type: Number },
  nombre: { type: String, required: true },
  tipo: { type: String, required: true },
  edad: { type: Number, required: true },
  usuario: { type: Number, ref: 'User', required: false },
});

const Pet = mongoose.model('Pet', petSchema);
export default Pet;