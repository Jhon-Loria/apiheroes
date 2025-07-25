import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';


import heroController from './controllers/heroController.js';
import petController from './controllers/petController.js';
import adoptionController from './controllers/adoptionController.js';
import allController from './controllers/allController.js';
import petGameController from './controllers/petGameController.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import authController from './controllers/authController.js';
import auth from './middleware/auth.js';
import dotenv from 'dotenv';
dotenv.config();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Superhéroes',
    version: '1.0.0',
    description: 'Documentación de la API de superhéroes, mascotas y adopciones'
  },
  servers: [
    {
      url: 'https://apiheroes-production.up.railway.app',
      description: 'Servidor en Railway'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['./controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

const app = express();

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error al conectar a MongoDB:', err));


app.use('/api/auth', authController);
// Rutas públicas (sin autenticación)
app.use('/api', heroController);
app.use('/api', petController);
app.use('/api', adoptionController);
app.use('/api', allController);
app.use('/api', petGameController);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
