import express from 'express';
import heroService from '../services/heroService.js';
import petService from '../services/petServices.js';

const router = express.Router();

/**
 * @swagger
 * /api/all:
 *   get:
 *     summary: Obtiene todos los héroes y todas las mascotas
 *     tags:
 *       - General
 *     responses:
 *       200:
 *         description: Listas de héroes y mascotas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 heroes:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pets:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/all', async (req, res) => {
  try {
    const heroes = await heroService.getAllHeroes();
    const pets = await petService.getAllPets();
    res.json({ heroes, pets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 