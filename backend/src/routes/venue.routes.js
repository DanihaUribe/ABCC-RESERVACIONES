// src/routes/venue.routes.js
const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venue.controller');

router.get('/venues', venueController.getAllVenues);
router.get('/venues/:id', venueController.getVenueById);

// Crear un nuevo espacio: no se usan pero por si acaso
router.post('/venues', venueController.createVenue);
router.put('/venues/:id', venueController.updateVenue);


module.exports = router;
