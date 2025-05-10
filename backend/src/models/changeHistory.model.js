/*
changeHistory.model.js (Historial de cambios)
create({ userId, actionChanged, reservationFolio }) — Registrar cambio

getByFolio(folio) — Ver historial de una reservación
*/
const db = require('../config/db');

const ChangeHistoryModel = {
    // Crear un nuevo registro en el historial de cambios
    async create({ user_id, action_changed, reservation_folio }) {
        const result = await db.query(`
            INSERT INTO change_history (user_id, action_changed, reservation_folio) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `, [user_id, action_changed, reservation_folio]);
        return result.rows[0];
    },

    // Obtener el historial de cambios para un folio de reserva
    async getByFolio(folio) {
        const result = await db.query(`
            SELECT 
                ch.change_id,
                ch.user_id,
                ch.action_changed,
                ch.reservation_folio,
                ch.action_date,
                u.username,
                u.user_role
            FROM change_history ch
            INNER JOIN user_table u ON ch.user_id = u.user_id
            WHERE ch.reservation_folio = $1
            ORDER BY ch.action_date DESC
        `, [folio]);
        return result.rows;
}
};

module.exports = ChangeHistoryModel;
