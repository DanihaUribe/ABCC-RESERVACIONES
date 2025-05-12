const express = require('express');
const router = express.Router();
const ReservationController = require('../controllers/reservation.controller');
const authenticateUser = require('../middlewares/authenticate');

// Rutas públicas: empleados
router.post('/', ReservationController.create);
router.get('/:folio', ReservationController.getByFolio);
router.get('/user/:folio', ReservationController.getByFolioForUsers);

router.get('/fecha/:venueId/:date', ReservationController.getByDateAndVenue);
//http://localhost:3000/api/reservations/fecha/1/2025-05-08

// Rutas protegidas: administrador
router.get('/', authenticateUser, ReservationController.getAll);
router.put('/:folio', authenticateUser, ReservationController.update);
router.get('/verificar/disponibilidad', authenticateUser, ReservationController.verifyAvailability);

module.exports = router;
