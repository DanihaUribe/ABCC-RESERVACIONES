const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authenticateUser = require('../middlewares/authenticate'); // ya lo usas
const onlyAdmin = require('../middlewares/onlyAdmin'); // aquí lo añades

router.post('/register', authenticateUser, onlyAdmin, AuthController.register); // ahora solo admins pueden registrar
router.post('/login', AuthController.login);

module.exports = router;
