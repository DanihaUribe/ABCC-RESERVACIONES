
const db = require('../config/db');
const VenueModel = {
    
    async getAll() {
        const result = await db.query('SELECT * FROM venue ORDER BY venue_id');
        return result.rows;
    },

    async getById(id) {
        const result = await db.query('SELECT * FROM venue WHERE venue_id = $1', [id]);
        return result.rows[0];
    },

    async create({ name, capacity, description }) {
        const result = await db.query(
          'INSERT INTO venue (name_venue, capacity, description) VALUES ($1, $2, $3) RETURNING *',
          [name, capacity, description]
        );
        return result.rows[0];
    },

    async update(id, data) {
        const fields = [];
        const values = [];
        let index = 1;

        //Recorrer los campos del objeto data para añadir los campos de forma dinámica
        for (let key in data) {
        fields.push(`${key} = $${index}`);
        values.push(data[key]);
        index++;
        }

        values.push(id);
        const query = `UPDATE venue SET ${fields.join(', ')} WHERE venue_id = $${index} RETURNING *`;
        const result = await db.query(query, values);
        return result.rows[0];
    },

};

module.exports = VenueModel;
