import express from 'express';
import Hero from '../models/heroModel.js';
import Counter from '../models/counterModel.js';
const router = express.Router();

/**
 * @swagger
 * /api/heroes:
 *   get:
 *     summary: Obtiene todos los héroes
 *     tags:
 *       - Héroes
 *     responses:
 *       200:
 *         description: Lista de héroes
 *   post:
 *     summary: Crea un nuevo héroe
 *     tags:
 *       - Héroes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               poder:
 *                 type: string
 *     responses:
 *       201:
 *         description: Héroe creado
 * /api/heroes/{id}:
 *   put:
 *     summary: Actualiza un héroe
 *     tags:
 *       - Héroes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               poder:
 *                 type: string
 *     responses:
 *       200:
 *         description: Héroe actualizado
 *       404:
 *         description: Héroe no encontrado
 *   delete:
 *     summary: Elimina un héroe
 *     tags:
 *       - Héroes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Héroe eliminado
 *       404:
 *         description: Héroe no encontrado
 */
// Obtener todos los héroes
router.get('/heroes', async (req, res) => {
  try {
    const heroes = await Hero.find();
    res.json(heroes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un héroe
router.post('/heroes', async (req, res) => {
  try {
    const { nombre, poder } = req.body;
    // Obtener el siguiente id
    let counter = await Counter.findByIdAndUpdate(
      'heroes',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const hero = new Hero({ _id: counter.seq, nombre, poder });
    await hero.save();
    res.status(201).json(hero);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un héroe
router.put('/heroes/:id', async (req, res) => {
  try {
    const { nombre, poder } = req.body;
    const hero = await Hero.findByIdAndUpdate(
      req.params.id,
      { nombre, poder },
      { new: true }
    );
    if (!hero) {
      return res.status(404).json({ error: 'Héroe no encontrado' });
    }
    res.json(hero);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un héroe
router.delete('/heroes/:id', async (req, res) => {
  try {
    const hero = await Hero.findByIdAndDelete(req.params.id);
    if (!hero) {
      return res.status(404).json({ error: 'Héroe no encontrado' });
    }
    res.json({ message: 'Héroe eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
  
  