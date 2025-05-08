// src/routes/venue.routes.js
const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venue.controller');

// Obtener todos los espacios
router.get('/venues', venueController.getAllVenues);

// Obtener un espacio por ID
router.get('/venues/:id', venueController.getVenueById);

// Crear un nuevo espacio
router.post('/venues', venueController.createVenue);

// Actualizar un espacio
router.put('/venues/:id', venueController.updateVenue);


module.exports = router;
