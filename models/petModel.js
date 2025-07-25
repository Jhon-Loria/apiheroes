import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
  _id: { type: Number },
  nombre: { type: String, required: true },
  tipo: { type: String, required: true },
  edad: { type: Number, required: true },
  usuario: { type: Number, ref: 'User', required: false },
  felicidad: { type: Number, default: 50 },
  hambre: { type: Number, default: 0 }
});

// MÉTODO PARA PASEAR
petSchema.methods.pasear = function() {
  if (typeof this.felicidad !== 'number') this.felicidad = 0;
  if (typeof this.hambre !== 'number') this.hambre = 0;
  this.felicidad = Math.min(this.felicidad + 10, 100);
  this.hambre = Math.min(this.hambre + 5, 100);
  return this.save();
};

petSchema.methods.jugar = function() {
  // Ejemplo de lógica: aumenta felicidad y hambre
  if (typeof this.felicidad !== 'number') this.felicidad = 0;
  if (typeof this.hambre !== 'number') this.hambre = 0;
  this.felicidad = Math.min(this.felicidad + 15, 100); // Jugar da más felicidad
  this.hambre = Math.min(this.hambre + 10, 100);       // Jugar da más hambre
  return this.save();
};

petSchema.methods.curar = function() {
  // Ejemplo de lógica: cura a la mascota (puedes ajustar según tu lógica)
  this.enfermedad = null; // Suponiendo que tienes un campo 'enfermedad'
  this.felicidad = Math.min((this.felicidad || 0) + 5, 100); // Curar da un poco de felicidad
  return this.save();
};

petSchema.methods.obtenerEstado = function() {
  // Devuelve el estado actual de la mascota
  return {
    _id: this._id,
    nombre: this.nombre,
    tipo: this.tipo,
    edad: this.edad,
    usuario: this.usuario,
    felicidad: this.felicidad,
    hambre: this.hambre
    // Agrega aquí otros campos que quieras mostrar
  };
};

const Pet = mongoose.model('Pet', petSchema);
export default Pet;