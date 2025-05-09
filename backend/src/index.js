// src/index.js
const express = require('express');
const cors = require('cors');  // Importa el paquete cors
const app = express();
const PORT = 3000;

// Middleware para aceptar JSON
app.use(express.json());

// Habilitar CORS para todas las rutas, o especificar dominios permitidos
app.use(cors({
  origin: 'http://localhost:4200'  // Especifica la URL del frontend (puedes cambiar esto si usas otro puerto o dominio)
}));

// Ruta de prueba (GET) para verificar que el servidor funciona
app.get('/', (req, res) => {
    res.send('Servidor express funcionando :D');
});

const venueRoutes = require('./routes/venue.routes');
app.use('/api', venueRoutes);

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const changeHistoryRoutes = require('./routes/changeHistory.routes');
app.use('/api', changeHistoryRoutes);

const reservationRoutes = require('./routes/reservation.routes');
app.use('/api/reservations', reservationRoutes);

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});




// Conexión a la base de datos
const pool = require('./config/db');
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'Conectado correctamente', hora: result.rows[0].now });
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        res.status(500).send('Error de conexión con la base de datos');
    }
});
// Cuando esté corriendo, imprime un mensaje en consola
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
