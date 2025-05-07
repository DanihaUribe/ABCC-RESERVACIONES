/*
changeHistory.model.js (Historial de cambios)
create({ userId, actionChanged, reservationFolio }) — Registrar cambio

getByFolio(folio) — Ver historial de una reservación
*/
const db = require('../config/db');
const ChangeHistoryModel = {
    async create({ userId, actionChanged, reservationFolio }) {
        const result = await db.query(`
            INSERT INTO change_history (user_id, action_changed, reservation_folio) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `, [userId, actionChanged, reservationFolio]);
        return result.rows[0];
    },

    async getByFolio(folio) {
        const result = await db.query(`
            SELECT * FROM change_history 
            WHERE reservation_folio = $1
        `, [folio]);
        return result.rows;
    }
};
module.exports = ChangeHistoryModel;