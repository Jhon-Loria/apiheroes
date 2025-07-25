import mongoose from 'mongoose';

const adoptionSchema = new mongoose.Schema({
  _id: { type: Number },
  usuario: { type: Number, ref: 'User', required: true },
  mascota: { type: Number, ref: 'Pet', required: true },
  heroe: { type: Number, ref: 'Hero', required: true },
  fecha: { type: Date, default: Date.now },
});

const Adoption = mongoose.model('Adoption', adoptionSchema);
export default Adoption;