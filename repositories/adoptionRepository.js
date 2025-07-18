import fs from 'fs-extra';
import Adoption from '../models/adoptionModel.js';

const filePath = './data/adoptions.json';

async function getAdoptions() {
  try {
    const data = await fs.readJson(filePath);
    return data.map(a => new Adoption(a.id, a.petId, a.heroId, a.date));
  } catch {
    return [];
  }
}

async function saveAdoptions(adoptions) {
  try {
    await fs.writeJson(filePath, adoptions);
  } catch (err) {
    console.error(err);
  }
}

export default {
  getAdoptions,
  saveAdoptions
};