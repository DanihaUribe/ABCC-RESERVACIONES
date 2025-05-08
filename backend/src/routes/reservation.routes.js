const express = require('express');
const router = express.Router();
const ReservationController = require('../controllers/reservation.controller');
const authenticateUser = require('../middlewares/authenticate');

// Rutas públicas: empleados
router.post('/', ReservationController.create);
router.get('/:folio', ReservationController.getByFolio);

// Rutas protegidas: administrador
router.get('/', authenticateUser, ReservationController.getAll);
router.get('/fecha/:venueId/:date', authenticateUser, ReservationController.getByDateAndVenue);
router.put('/:folio', authenticateUser, ReservationController.update);
router.get('/verificar/disponibilidad', authenticateUser, ReservationController.verifyAvailability);

module.exports = router;
