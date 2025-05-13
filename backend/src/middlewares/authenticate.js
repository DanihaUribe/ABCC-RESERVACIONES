const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado o inválido' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY); // SECRET_KEY en .env
        req.user_id = decoded.user_id;
        req.role = decoded.role;
        next();
    } catch (error) {
        console.error('Error al verificar token JWT:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

module.exports = authenticateUser;
