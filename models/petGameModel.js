import mongoose from 'mongoose';

const petGameSchema = new mongoose.Schema({
  _id: { type: Number },
  mascota: { type: Number, ref: 'Pet', required: true },
  accion: { type: String, required: true },
  detalle: { type: String },
  timestamp: { type: Date, default: Date.now },
  felicidad: { type: Number },
  hambre: { type: Number },
  enfermedad: { type: String },
});

const PetGame = mongoose.model('PetGame', petGameSchema);
export default PetGame; 