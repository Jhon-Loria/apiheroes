import mongoose from 'mongoose';
import User from './models/userModel.js';
import Hero from './models/heroModel.js';
import Pet from './models/petModel.js';
import Adoption from './models/adoptionModel.js';
import PetGame from './models/petGameModel.js';
import Counter from './models/counterModel.js';

const MONGO_URI = 'mongodb+srv://JhonLoria:12345@cluster0.jis7npg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function migrateCollection(Model, counterName, refUpdates = []) {
  const docs = await Model.find({ _id: { $type: 'objectId' } });
  if (!docs.length) return {};
  let counter = await Counter.findById(counterName);
  let seq = counter ? counter.seq : 0;
  const idMap = {};
  for (const doc of docs) {
    seq++;
    const newDoc = doc.toObject();
    const oldId = doc._id;
    newDoc._id = seq;
    delete newDoc.__v;
    await Model.create(newDoc);
    await Model.deleteOne({ _id: oldId });
    idMap[oldId.toString()] = seq;
  }
  await Counter.findByIdAndUpdate(counterName, { seq }, { upsert: true });
  // Actualizar referencias en otras colecciones
  for (const { Model: RefModel, field } of refUpdates) {
    for (const [oldId, newId] of Object.entries(idMap)) {
      await RefModel.updateMany({ [field]: oldId }, { [field]: newId });
    }
  }
  return idMap;
}

async function main() {
  await mongoose.connect(MONGO_URI);
  // Usuarios
  await migrateCollection(User, 'usuarios');
  // Héroes
  const heroMap = await migrateCollection(Hero, 'heroes', [
    { Model: Adoption, field: 'heroe' },
    { Model: PetGame, field: 'heroe' }
  ]);
  // Mascotas
  const petMap = await migrateCollection(Pet, 'mascotas', [
    { Model: Adoption, field: 'mascota' },
    { Model: PetGame, field: 'mascota' }
  ]);
  // Adopciones
  await migrateCollection(Adoption, 'adopciones');
  // PetGame
  await migrateCollection(PetGame, 'petgame');
  await mongoose.disconnect();
  console.log('Migración completada.');
}

main().catch(err => {
  console.error('Error en la migración:', err);
  process.exit(1);
}); 