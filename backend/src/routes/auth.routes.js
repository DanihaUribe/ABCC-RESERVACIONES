const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authenticateUser = require('../middlewares/authenticate');
const onlyAdmin = require('../middlewares/onlyAdmin');

router.post('/login', AuthController.login);
// solo admins pueden registrar: no se llego a implementar pero se usa en postman
router.post('/register', authenticateUser, onlyAdmin, AuthController.register); 

module.exports = router;
