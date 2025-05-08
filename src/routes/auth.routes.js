const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authenticateUser = require('../middlewares/authenticate');
const onlyAdmin = require('../middlewares/onlyAdmin');

router.post('/register', authenticateUser, onlyAdmin, AuthController.register); // solo admins pueden registrar
router.post('/login', AuthController.login);

module.exports = router;
