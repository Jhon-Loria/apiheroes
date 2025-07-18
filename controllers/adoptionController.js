import express from 'express';
import Adoption from '../models/adoptionModel.js';
import Counter from '../models/counterModel.js';
const router = express.Router();

/**
 * @swagger
 * /api/adoptions:
 *   get:
 *     summary: Obtiene todas las adopciones del usuario autenticado
 *     tags:
 *       - Adopciones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de adopciones
 *   post:
 *     summary: Crea una nueva adopción para el usuario autenticado
 *     tags:
 *       - Adopciones
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mascota:
 *                 type: string
 *               heroe:
 *                 type: string
 *     responses:
 *       201:
 *         description: Adopción creada
 * /api/adoptions/{id}:
 *   put:
 *     summary: Actualiza una adopción del usuario autenticado
 *     tags:
 *       - Adopciones
 *     security:
 *       - bearerAuth: []
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
 *               mascota:
 *                 type: string
 *               heroe:
 *                 type: string
 *     responses:
 *       200:
 *         description: Adopción actualizada
 *       404:
 *         description: Adopción no encontrada
 *   delete:
 *     summary: Elimina una adopción del usuario autenticado
 *     tags:
 *       - Adopciones
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Adopción eliminada
 *       404:
 *         description: Adopción no encontrada
 */
// Obtener todas las adopciones del usuario autenticado
router.get('/adoptions', async (req, res) => {
  try {
    const adoptions = await Adoption.find().populate('mascota heroe');
    res.json(adoptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear una adopción para el usuario autenticado
router.post('/adoptions', async (req, res) => {
  try {
    const { mascota, heroe } = req.body;
    // Obtener el siguiente id
    let counter = await Counter.findByIdAndUpdate(
      'adopciones',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const adoption = new Adoption({ _id: counter.seq, mascota, heroe });
    await adoption.save();
    res.status(201).json(adoption);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una adopción del usuario autenticado
router.put('/adoptions/:id', async (req, res) => {
  try {
    const { mascota, heroe } = req.body;
    const adoption = await Adoption.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user._id },
      { mascota, heroe },
      { new: true }
    );
    if (!adoption) {
      return res.status(404).json({ error: 'Adopción no encontrada' });
    }
    res.json(adoption);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una adopción del usuario autenticado
router.delete('/adoptions/:id', async (req, res) => {
  try {
    const adoption = await Adoption.findOneAndDelete({ _id: req.params.id, usuario: req.user._id });
    if (!adoption) {
      return res.status(404).json({ error: 'Adopción no encontrada' });
    }
    res.json({ message: 'Adopción eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;