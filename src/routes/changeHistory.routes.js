const express = require('express');
const router = express.Router();
const ChangeHistoryController = require('../controllers/changeHistory.controller');

// Crear un nuevo registro de historial de cambios
router.post('/change-history', ChangeHistoryController.createChangeHistory);

// Obtener historial de cambios por folio
router.get('/change-history/:folio', ChangeHistoryController.getChangeHistoryByFolio);

module.exports = router;
