import express from 'express';
import { check, validationResult } from 'express-validator';
import Pet from '../models/petModel.js';
import PetGame from '../models/petGameModel.js';
import Counter from '../models/counterModel.js';
import petService from '../services/petServices.js';
import heroService from '../services/heroService.js';
import auth from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PetGame:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         type:
 *           type: string
 *         power:
 *           type: string
 *         ownerId:
 *           type: integer
 *         felicidad:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         hambre:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         enfermedad:
 *           type: string
 *           nullable: true
 *         itemsCustom:
 *           type: array
 *           items:
 *             type: string
 *         viva:
 *           type: boolean
 *         estado:
 *           type: string
 *           enum: [Saludable, Enferma, Fallecida]
 */

/**
 * @swagger
 * /api/mascotas/{id}/estado:
 *   get:
 *     summary: Obtiene el estado completo de una mascota del usuario autenticado
 *     tags:
 *       - Juego de Mascotas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la mascota
 *     responses:
 *       200:
 *         description: Estado de la mascota
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PetGame'
 *       404:
 *         description: Mascota no encontrada
 */
// Obtener el estado de una mascota SOLO si pertenece al usuario autenticado
router.get('/mascotas/:id/estado', auth, async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, usuario: req.user._id });
    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada o no autorizada' });
    }
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/mascotas/{id}/alimentar:
 *   put:
 *     summary: Alimenta a una mascota del usuario autenticado
 *     tags:
 *       - Juego de Mascotas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la mascota
 *     responses:
 *       200:
 *         description: Resultado de la alimentación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 estado:
 *                   $ref: '#/components/schemas/PetGame'
 *       404:
 *         description: Mascota no encontrada
 */
// Alimentar a una mascota SOLO si pertenece al usuario autenticado
router.put('/mascotas/:id/alimentar', auth, async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, usuario: req.user._id });
    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada o no autorizada' });
    }
    pet.hambre = 100;
    await pet.save();
    // Guardar acción en PetGame
    let counter = await Counter.findByIdAndUpdate(
      'petgame',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const gameAction = new PetGame({
      _id: counter.seq,
      mascota: pet._id,
      accion: 'alimentar',
      felicidad: pet.felicidad,
      hambre: pet.hambre,
      enfermedad: pet.enfermedad || null
    });
    await gameAction.save();
    res.json({ success: true, message: 'Mascota alimentada', estado: pet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/mascotas/{id}/pasear:
 *   put:
 *     summary: Saca a pasear a una mascota del usuario autenticado
 *     tags:
 *       - Juego de Mascotas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la mascota
 *     responses:
 *       200:
 *         description: Resultado del paseo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 estado:
 *                   $ref: '#/components/schemas/PetGame'
 *       404:
 *         description: Mascota no encontrada
 */
router.put('/mascotas/:id/pasear', auth, async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, usuario: req.user._id });
    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada o no autorizada' });
    }
    
    const resultado = pet.pasear();
    await petService.updatePet(pet.id, pet);
    
    res.json({
      ...resultado,
      estado: pet.obtenerEstado()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/mascotas/{id}/jugar:
 *   put:
 *     summary: Juega con una mascota del usuario autenticado
 *     tags:
 *       - Juego de Mascotas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la mascota
 *     responses:
 *       200:
 *         description: Resultado del juego
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 estado:
 *                   $ref: '#/components/schemas/PetGame'
 *       404:
 *         description: Mascota no encontrada
 */
router.put('/mascotas/:id/jugar', auth, async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, usuario: req.user._id });
    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada o no autorizada' });
    }
    
    const resultado = pet.jugar();
    await petService.updatePet(pet.id, pet);
    
    res.json({
      ...resultado,
      estado: pet.obtenerEstado()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/mascotas/{id}/curar:
 *   put:
 *     summary: Cura a una mascota enferma del usuario autenticado
 *     tags:
 *       - Juego de Mascotas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la mascota
 *     responses:
 *       200:
 *         description: Resultado de la curación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 estado:
 *                   $ref: '#/components/schemas/PetGame'
 *       404:
 *         description: Mascota no encontrada
 */
router.put('/mascotas/:id/curar', auth, async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, usuario: req.user._id });
    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada o no autorizada' });
    }
    
    const resultado = pet.curar();
    await petService.updatePet(pet.id, pet);
    
    res.json({
      ...resultado,
      estado: pet.obtenerEstado()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/mascotas/{id}/vestir:
 *   put:
 *     summary: Viste a una mascota del usuario autenticado con un item
 *     tags:
 *       - Juego de Mascotas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la mascota
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               item:
 *                 type: string
 *                 description: Nombre del item a vestir
 *     responses:
 *       200:
 *         description: Resultado de vestir la mascota
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 estado:
 *                   $ref: '#/components/schemas/PetGame'
 *       404:
 *         description: Mascota no encontrada
 */
router.put('/mascotas/:id/vestir', auth, [
  check('item').notEmpty().withMessage('El item es requerido')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const pet = await Pet.findOne({ _id: req.params.id, usuario: req.user._id });
    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada o no autorizada' });
    }

    // Asegúrate de que el campo itemsCustom exista y sea un array
    if (!pet.itemsCustom) pet.itemsCustom = [];
    pet.itemsCustom.push(req.body.item);
    await pet.save();

    res.json({
      success: true,
      message: `Item ${req.body.item} agregado a la mascota`,
      mascota: pet
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/superheroes/{id}/mascotas:
 *   get:
 *     summary: Obtiene todas las mascotas de un superhéroe
 *     tags:
 *       - Juego de Mascotas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del superhéroe
 *     responses:
 *       200:
 *         description: Lista de mascotas del superhéroe
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PetGame'
 *       404:
 *         description: Superhéroe no encontrado
 */
router.get('/superheroes/:id/mascotas', async (req, res) => {
  try {
    const hero = await heroService.getHeroById(req.params.id);
    if (!hero) {
      return res.status(404).json({ error: 'Superhéroe no encontrado' });
    }
    
    const pets = await petService.getPetsByOwnerId(req.params.id);
    const mascotasConEstado = pets.map(pet => pet.obtenerEstado());
    
    res.json(mascotasConEstado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/mascotas/{id}/historial:
 *   get:
 *     summary: Obtiene el historial de acciones de una mascota del usuario autenticado
 *     tags:
 *       - Juego de Mascotas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la mascota
 *     responses:
 *       200:
 *         description: Historial de acciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mascota:
 *                   $ref: '#/components/schemas/PetGame'
 *                 historial:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       accion:
 *                         type: string
 *                       detalle:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                       felicidad:
 *                         type: integer
 *                       hambre:
 *                         type: integer
 *                       enfermedad:
 *                         type: string
 *       404:
 *         description: Mascota no encontrada
 */
router.get('/mascotas/:id/historial', auth, async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, usuario: req.user._id });
    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada o no autorizada' });
    }
    
    res.json({
      mascota: pet.obtenerEstado(),
      historial: pet.historial
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/mascotas/{id}/enfermar:
 *   put:
 *     summary: Enferma a una mascota del usuario autenticado (para testing)
 *     tags:
 *       - Juego de Mascotas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la mascota
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enfermedad:
 *                 type: string
 *                 enum: [Sarpullido, Gripa, Piel de Salchicha, Piojos de lata]
 *     responses:
 *       200:
 *         description: Mascota enfermada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 estado:
 *                   $ref: '#/components/schemas/PetGame'
 *       404:
 *         description: Mascota no encontrada
 */
router.put('/mascotas/:id/enfermar', auth, [
  check('enfermedad').isIn(['Sarpullido', 'Gripa', 'Piel de Salchicha', 'Piojos de lata']).withMessage('Enfermedad no válida')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const pet = await Pet.findOne({ _id: req.params.id, usuario: req.user._id });
    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada o no autorizada' });
    }
    
    pet.enfermar(req.body.enfermedad);
    await petService.updatePet(pet.id, pet);
    
    res.json({
      message: `Mascota enfermada con ${req.body.enfermedad}`,
      estado: pet.obtenerEstado()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 