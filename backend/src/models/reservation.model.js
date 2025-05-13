const moment = require('moment');
const db = require('../config/db');


const ReservationModel = {
    // Trae una reservación por el folio
    async getByFolio(folio) {
        const result = await db.query(`
            SELECT 
                reservation.*, 
                venue.name_venue AS venue_name
            FROM reservation
            INNER JOIN venue ON reservation.venue_id = venue.venue_id
            WHERE reservation.folio = $1
        `, [folio]);
        return result.rows[0];
    },

    //trae las reservaciones que ya ocupan un espacio por dia y espacio
    async getByDateAndVenue(venueId, date) {
        const result = await db.query(`
            SELECT 
                reservation.*, 
                venue.name_venue AS venue_name
            FROM reservation
            INNER JOIN venue ON reservation.venue_id = venue.venue_id
            WHERE reservation.venue_id = $1
            AND reservation.reservation_date = $2
            AND reservation.status IN ('Pendiente', 'Aprobada')
            ORDER BY reservation.start_time ASC
        `, [venueId, date]);
        return result.rows;
    },

    // Crea una reservación y crea un folio RES-1-250506-1056 "RES- NUMERO DE LA RESERVACIÓN - YYMMDD - HHMM" 
    async create({ requesterName, venueId, reservationDate, startTime, endTime, status, description }) {
        const countResult = await db.query(`SELECT COUNT(*) FROM reservation`);
        const count = parseInt(countResult.rows[0].count) + 1;
        const now = moment();
        const datePart = now.format('YYMMDD');
        const timePart = now.format('HHmm');
        const folio = `RES-${count}-${datePart}-${timePart}`;

        const result = await db.query(`
            INSERT INTO reservation (
                folio, requester_name, venue_id, reservation_date, 
                start_time, end_time, status, description
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [folio, requesterName, venueId, reservationDate, startTime, endTime, status, description]);

        return result.rows[0];
    },

    // Actualiza una reservación por folio (permite editar uno o varios campos)
    async updateReservationByFolio(folio, data) {
        const fields = [];
        const values = [];
        let index = 1;

        for (const [key, value] of Object.entries(data)) {
            fields.push(`${key} = $${index}`);
            values.push(value);
            index++;
        }

        const query = `
          UPDATE reservation
          SET ${fields.join(', ')}
          WHERE folio = $${index}
          RETURNING *;
        `;

        values.push(folio);

        const result = await db.query(query, values);
        return result.rows[0];
    },

    // !!Trae todas las reservaciones, excluyendo las canceladas
    async getAll() {
        const result = await db.query(`
        SELECT 
            reservation.*, 
            venue.name_venue AS venue_name 
        FROM reservation
        INNER JOIN venue ON reservation.venue_id = venue.venue_id 
        WHERE reservation.status != $1
        ORDER BY reservation.created_at DESC
    `, ['Cancelada']);
        return result.rows;
    },

    // Verifica que haya espacio libre en un venue para una fecha y rango de horas (no contamos esta si esta cancelada o rechazada)
    async verifyAvailability(venueId, date, startTime, endTime, reservationId = null) {
        let query = `
        SELECT * FROM reservation
        WHERE venue_id = $1
          AND reservation_date = $2
          AND status NOT IN ('Cancelada', 'Rechazada')
          AND (
              (start_time < $4 AND end_time > $3)
          )
        `;
        // Si la actualización de una reserva está en curso, excluimos la propia reserva
        if (reservationId) {
            query += ` AND folio != $5`; //excluir la reserva actual
        }

        const values = reservationId ? [venueId, date, startTime, endTime, reservationId] : [venueId, date, startTime, endTime];
        const result = await db.query(query, values);
        // Si hay resultados, significa que el espacio ya está ocupado
        return result.rows.length === 0;
    },

    // Trae una reservación por el folio con su historial de cambios
    async getByFolioForUsers(folio) {
        try {
            // Consulta para obtener el estado actual de la reserva
            const reservaResult = await db.query(`
            SELECT 
                reservation.folio,
                reservation.status
            FROM reservation
            WHERE reservation.folio = $1
        `, [folio]);

            // Si no se encuentra la reserva, lanzamos un error
            if (reservaResult.rows.length === 0) {
                throw new Error('Reserva no encontrada');
            }

            // Consulta para obtener el historial de cambios de la reserva
            const historyResult = await db.query(`
            SELECT 
                action_changed, 
                action_date
            FROM change_history
            WHERE reservation_folio = $1
            ORDER BY action_date DESC
        `, [folio]);

            // Construcción del JSON con la información
            const reserva = reservaResult.rows[0];
            const history = historyResult.rows;

            //! Retornamos el objeto combinado!
            return {
                folio: reserva.folio,
                status: reserva.status,
                history_changed: history.map(change => ({
                    action_changed: change.action_changed,
                    action_date: change.action_date
                }))
            };

        } catch (error) {
            throw error;
        }

    }



};

module.exports = ReservationModel;
