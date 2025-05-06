const express = require('express');
const app = express();
const PORT = 3000;

//Middleware para aceptar json
app.use(express.json());
// Ruta de prueba (GET) para verificar que el servidor funciona.
app.get('/', (req, res) => {
    res.send('Servidor express funcionando :D');
});
// Cuando esté corriendo, imprime un mensaje en consola.
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

/// Importa el módulo de conexión a la base de datos (definido en otro archivo llamado db.js).
const pool = require('./config/db');
// Ejecuta una consulta SQL simple (SELECT NOW()) para obtener la hora actual del servidor de BD.
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'Conectado correctamente', hora: result.rows[0].now });
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        res.status(500).send('Error de conexión con la base de datos');
    }
});

