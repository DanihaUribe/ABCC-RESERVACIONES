const express = require('express');
const app = express();
const PORT = 3000;

//Middleware para aceptar json
app.use(express.json());
//ruta prueba
app.get('/', (req, res) => {
    res.send('Servidor express funcionando :D');
});
//iniciar servidor 
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

//db
const pool = require('./db');

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'Conectado correctamente', hora: result.rows[0].now });
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        res.status(500).send('Error de conexión con la base de datos');
    }
});

