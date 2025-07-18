import petService from './petServices.js';
import heroService from './heroService.js';
import adoptionRepository from '../repositories/adoptionRepository.js';
import Adoption from '../models/adoptionModel.js';

async function assignOwner(petId, heroId) {
  const pets = await petService.getAllPets();
  const pet = pets.find(p => p.id === parseInt(petId));
  if (!pet) throw new Error('Mascota no encontrada');

  const heroes = await heroService.getAllHeroes();
  const hero = heroes.find(h => h.id === parseInt(heroId));
  if (!hero) throw new Error('Héroe no encontrado');

  // Verificar que la mascota no esté ya adoptada
  if (pet.ownerId) {
    throw new Error(`La mascota ${pet.name} ya tiene un dueño`);
  }

  // Asignar el dueño
  pet.ownerId = hero.id;
  await petService.updatePet(petId, pet);

  // Guardar historial de adopción
  const adoptions = await adoptionRepository.getAdoptions();
  const newId = adoptions.length > 0 ? Math.max(...adoptions.map(a => a.id)) + 1 : 1;
  const newAdoption = new Adoption(newId, parseInt(petId), parseInt(heroId));
  adoptions.push(newAdoption);
  await adoptionRepository.saveAdoptions(adoptions);

  return `La mascota ${pet.name} fue adoptada por ${hero.alias}`;
}

async function getAdoptions() {
  const pets = await petService.getAllPets();
  const heroes = await heroService.getAllHeroes();

  return pets
    .filter(p => p.ownerId)
    .map(p => {
      const owner = heroes.find(h => h.id === p.ownerId);
      return {
        ...p,
        ownerAlias: owner ? owner.alias : null
      };
    });
}

async function getAdoptionHistory() {
  const adoptions = await adoptionRepository.getAdoptions();
  const pets = await petService.getAllPets();
  const heroes = await heroService.getAllHeroes();

  return adoptions
    .filter(ad => ad.petId && ad.heroId) // Filtrar adopciones con datos completos
    .map(ad => {
      const pet = pets.find(p => p.id === ad.petId);
      const hero = heroes.find(h => h.id === ad.heroId);

      // Solo retornar si tanto la mascota como el héroe existen
      if (pet && hero) {
        return {
          id: ad.id,
          pet: { id: pet.id, name: pet.name },
          hero: { id: hero.id, alias: hero.alias },
          date: ad.date
        };
      }
      return null;
    })
    .filter(ad => ad !== null); // Eliminar adopciones con datos faltantes
}

async function updateAdoption(id, data) {
  const adoptions = await adoptionRepository.getAdoptions();
  const index = adoptions.findIndex(a => a.id === parseInt(id));
  if (index === -1) throw new Error('Adopción no encontrada');

  // Permitir actualizar petId, heroId y date
  if (data.petId !== undefined) adoptions[index].petId = data.petId;
  if (data.heroId !== undefined) adoptions[index].heroId = data.heroId;
  if (data.date !== undefined) adoptions[index].date = data.date;

  await adoptionRepository.saveAdoptions(adoptions);
  return adoptions[index];
}

async function deleteAdoption(id) {
  const adoptions = await adoptionRepository.getAdoptions();
  const index = adoptions.findIndex(a => a.id === parseInt(id));
  if (index === -1) throw new Error('Adopción no encontrada');
  const deleted = adoptions.splice(index, 1)[0];
  await adoptionRepository.saveAdoptions(adoptions);
  return deleted;
}

export default {
  assignOwner,
  getAdoptions,
  getAdoptionHistory,
  updateAdoption,
  deleteAdoption
};