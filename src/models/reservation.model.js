/*
reservation.model.js (Reservas)

getByFolio(folio)
getByDateAndVenue(venueId, date) — Consultar reservas por espacio y día
create({ folio, requesterName, venueId, reservationDate, startTime, endTime, status, description })
updateReservationByFolio(folio, data) — Editar  uno o varios campos a la vez (espacio, fecha, hora, estado)
getAll() — Solo para administradores
verifyAvailability(venueId, date, startTime, endTime) — Verificar disponibilidad real


*/
const moment = require('moment');
const db = require('../confing/db');
const ReservationModel = {

    //trae una reservación por el folio
    async getByFolio(folio) {
        const result = await db.query(`
            SELECT * FROM reservation 
            WHERE folio = 1$
        `,[folio]);
        return result.rows[0];
    },

    //trae las reservaciones que ya ocupan un espacio por dia y espacio
    async getByDateAndVenue(venueId, date) {
        const result = await db.query(`
            SELECT folio, start_time, end_time, status, requester_name, description 
            FROM reservation
            WHERE venue_id = $1
            AND reservation_date = $2
            AND status IN ('Pendiente', 'Aprobada')
            ORDER BY start_time ASC
        `, [venueId, date]);
        return result.rows;
    },

    //Crea una reservación y crea un folio RES-1-250506-1056 "RES- NUMERO DE LA RESERVACIÓN - YYMMDD - HHMM" 
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

    async getAll() {
        const result = await db.query(
            "SELECT * FROM reservation WHERE status != $1",
            ['Cancelada']
        );
        return result.rows;
    },
    
    //verifica que halla espacio libre
    async verifyAvailability(venueId, date, startTime, endTime) {
        const query = `
            SELECT * FROM reservation
            WHERE venue_id = $1
              AND reservation_date = $2
              AND status != 'Cancelada'
              AND (
                  (start_time < $4 AND end_time > $3)
              )
        `;
        const values = [venueId, date, startTime, endTime];
        const result = await db.query(query, values);
        
        // Si hay resultados, significa que ya está ocupado
        return result.rows.length === 0;
    },
    

};
module.exports = ReservationModel;