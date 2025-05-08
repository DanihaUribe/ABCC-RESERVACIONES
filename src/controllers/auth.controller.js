const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

const AuthController = {
    async register(req, res) {
        const { username, password, userRole } = req.body;
    
        if (!username || !password || password.length < 6) {
            return res.status(400).json({ message: 'Usuario o contraseña inválidos (mínimo 6 caracteres)' });
        }
    
        const allowedRoles = ['Administrador', 'Jefe de departamento'];
        if (!allowedRoles.includes(userRole)) {
            return res.status(400).json({ message: 'Rol de usuario inválido' });
        }
    
        const existingUser = await UserModel.findByUsername(username);
        if (existingUser) return res.status(400).json({ message: 'Usuario ya existe' });
    
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await UserModel.create({ username, passwordHash, userRole });
    
        res.status(201).json({ message: 'Usuario creado', user: { id: newUser.user_id, username, userRole } });
    },

    async login(req, res) {
        const { username, password } = req.body;

        const user = await UserModel.findByUsername(username);
        if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ message: 'Credenciales inválidas' });

        const token = jwt.sign(
            { user_id: user.user_id, username: user.username, role: user.user_role },
            SECRET_KEY,
            { expiresIn: '2h' }
        );

        res.json({ message: 'Login exitoso', token });

    }
};

module.exports = AuthController;