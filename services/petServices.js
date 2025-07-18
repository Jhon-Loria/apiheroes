import petRepository from '../repositories/petRepository.js';
import Pet from '../models/petModel.js';

async function getAllPets() {
  return await petRepository.getPets();
}

async function getPetById(id) {
  const pets = await petRepository.getPets();
  const pet = pets.find(p => p.id === parseInt(id));
  if (!pet) return null;
  
  // Convertir el objeto plano a instancia de Pet con métodos
  return new Pet(
    pet.id,
    pet.name,
    pet.type,
    pet.power,
    pet.ownerId,
    pet.felicidad || 50,
    pet.hambre || 50,
    pet.enfermedad || null,
    pet.itemsCustom || [],
    pet.viva !== false,
    pet.historial || []
  );
}

async function getPetsByOwnerId(ownerId) {
  const pets = await petRepository.getPets();
  return pets
    .filter(p => p.ownerId === parseInt(ownerId))
    .map(pet => new Pet(
      pet.id,
      pet.name,
      pet.type,
      pet.power,
      pet.ownerId,
      pet.felicidad || 50,
      pet.hambre || 50,
      pet.enfermedad || null,
      pet.itemsCustom || [],
      pet.viva !== false,
      pet.historial || []
    ));
}

async function addPet(pet) {
  const pets = await petRepository.getPets();
  const newId = pets.length > 0 ? Math.max(...pets.map(p => p.id)) + 1 : 1;
  // Asegurarse de que todos los campos estén presentes
  const newPet = {
    id: newId,
    name: pet.name,
    type: pet.type,
    power: pet.power,
    ownerId: pet.ownerId ?? null,
    felicidad: pet.felicidad ?? 50,
    hambre: pet.hambre ?? 50,
    enfermedad: pet.enfermedad ?? null,
    itemsCustom: pet.itemsCustom ?? [],
    viva: pet.viva ?? true,
    historial: pet.historial ?? []
  };

  pets.push(newPet);
  await petRepository.savePets(pets);
  return newPet;
}

async function updatePet(id, updatedPet) {
  const pets = await petRepository.getPets();
  const index = pets.findIndex(p => p.id === parseInt(id));
  if (index === -1) throw new Error('Mascota no encontrada');

  // Actualizar todos los campos respetando los personalizados
  const petToSave = {
    id: pets[index].id,
    name: updatedPet.name ?? pets[index].name,
    type: updatedPet.type ?? pets[index].type,
    power: updatedPet.power ?? pets[index].power,
    ownerId: updatedPet.ownerId ?? pets[index].ownerId,
    felicidad: updatedPet.felicidad ?? pets[index].felicidad,
    hambre: updatedPet.hambre ?? pets[index].hambre,
    enfermedad: updatedPet.enfermedad ?? pets[index].enfermedad,
    itemsCustom: updatedPet.itemsCustom ?? pets[index].itemsCustom,
    viva: updatedPet.viva ?? pets[index].viva,
    historial: updatedPet.historial ?? pets[index].historial
  };

  pets[index] = petToSave;
  await petRepository.savePets(pets);
  return pets[index];
}

async function deletePet(id) {
  const pets = await petRepository.getPets();
  const newList = pets.filter(p => p.id !== parseInt(id));
  if (newList.length === pets.length) throw new Error('Mascota no encontrada');

  await petRepository.savePets(newList);
  return { message: 'Mascota eliminada' };
}

export default {
  getAllPets,
  getPetById,
  getPetsByOwnerId,
  addPet,
  updatePet,
  deletePet
};