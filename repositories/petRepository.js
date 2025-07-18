import fs from 'fs-extra';
import Pet from '../models/petModel.js';

const filePath = './data/pets.json';

async function getPets() {
  try {
    const data = await fs.readJson(filePath);
    // No crear nuevas instancias, solo devolver los objetos tal como están en el JSON
    return data;
  } catch {
    return [];
  }
}

async function savePets(pets) {
  try {
    await fs.writeJson(filePath, pets);
  } catch (error) {
    console.error(error);
  }
}

export default {
  getPets,
  savePets
};