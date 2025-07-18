import express from 'express';
import Pet from '../models/petModel.js';
import Counter from '../models/counterModel.js';
import auth from '../middleware/auth.js';
const router = express.Router();

/**
 * @swagger
 * /api/pets:
 *   get:
 *     summary: Obtiene todas las mascotas del usuario autenticado
 *     tags:
 *       - Mascotas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mascotas
 *   post:
 *     summary: Crea una nueva mascota para el usuario autenticado
 *     tags:
 *       - Mascotas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               tipo:
 *                 type: string
 *               edad:
 *                 type: number
 *     responses:
 *       201:
 *         description: Mascota creada
 * /api/pets/{id}:
 *   put:
 *     summary: Actualiza una mascota del usuario autenticado
 *     tags:
 *       - Mascotas
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
 *               nombre:
 *                 type: string
 *               tipo:
 *                 type: string
 *               edad:
 *                 type: number
 *     responses:
 *       200:
 *         description: Mascota actualizada
 *       404:
 *         description: Mascota no encontrada
 *   delete:
 *     summary: Elimina una mascota del usuario autenticado
 *     tags:
 *       - Mascotas
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
 *         description: Mascota eliminada
 *       404:
 *         description: Mascota no encontrada
 */
// Obtener todas las mascotas SOLO del usuario autenticado
router.get('/pets', auth, async (req, res) => {
  try {
    const pets = await Pet.find({ usuario: req.user._id });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear una mascota y asociarla al usuario autenticado
router.post('/pets', auth, async (req, res) => {
  try {
    const { nombre, tipo, edad } = req.body;
    // Obtener el siguiente id
    let counter = await Counter.findByIdAndUpdate(
      'mascotas',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const pet = new Pet({ _id: counter.seq, nombre, tipo, edad, usuario: req.user._id });
    await pet.save();
    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una mascota SOLO si pertenece al usuario autenticado
router.put('/pets/:id', auth, async (req, res) => {
  try {
    const { nombre, tipo, edad } = req.body;
    // Buscar la mascota y verificar que sea del usuario
    const pet = await Pet.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user._id },
      { nombre, tipo, edad },
      { new: true }
    );
    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada o no autorizada' });
    }
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una mascota SOLO si pertenece al usuario autenticado
router.delete('/pets/:id', auth, async (req, res) => {
  try {
    const pet = await Pet.findOneAndDelete({ _id: req.params.id, usuario: req.user._id });
    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada o no autorizada' });
    }
    res.json({ message: 'Mascota eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;