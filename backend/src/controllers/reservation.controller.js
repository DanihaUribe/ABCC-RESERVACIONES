const ReservationModel = require('../models/reservation.model');
const ChangeHistoryModel = require('../models/changeHistory.model');

const ReservationController = {

    // Obtener reservación por folio
    async getByFolio(req, res) {
        try {
            const { folio } = req.params;
            const reservation = await ReservationModel.getByFolio(folio);

            if (!reservation) {
                return res.status(404).json({ error: 'Reservación no encontrada' });
            }

            res.json(reservation);
        } catch (error) {
            console.error('Error en getByFolio:', error);
            res.status(500).json({ error: 'Error al obtener la reservación' });
        }
    },

    // Obtener todas las reservaciones (excepto canceladas)
    async getAll(req, res) {
        try {
            const reservations = await ReservationModel.getAll();
            res.json(reservations);
        } catch (error) {
            console.error('Error en getAll:', error);
            res.status(500).json({ error: 'Error al obtener las reservaciones' });
        }
    },

    // Obtener reservaciones por fecha y venue
    async getByDateAndVenue(req, res) {
        try {
            const { venueId, date } = req.params;

            if (!venueId || !date) {
                return res.status(400).json({ error: 'Faltan parámetros: venueId y/o date' });
            }

            const reservations = await ReservationModel.getByDateAndVenue(venueId, date);
            res.json(reservations);
        } catch (error) {
            console.error('Error en getByDateAndVenue:', error);
            res.status(500).json({ error: 'Error al obtener las reservaciones' });
        }
    },

    // Crear nueva reservación: todas entran como pendientes, pues solo son hechas por el empleado
    async create(req, res) {
        try {
            const { requesterName, venueId, reservationDate, startTime, endTime, description } = req.body;
    
            // Verificamos que los datos obligatorios estén presentes
            if (!requesterName || !venueId || !reservationDate || !startTime || !endTime) {
                return res.status(400).json({ error: 'Faltan datos obligatorios' });
            }
    
            // Verificamos la disponibilidad del espacio
            const isAvailable = await ReservationModel.verifyAvailability(
                venueId,
                reservationDate,
                startTime,
                endTime
            );
    
            if (!isAvailable) {
                return res.status(409).json({ error: 'El espacio no está disponible en ese horario' });
            }
    
            // Creamos la reservación con el estado 'Pendiente' por defecto
            const newReservation = await ReservationModel.create({
                requesterName,
                venueId,
                reservationDate,
                startTime,
                endTime,
                status: 'Pendiente',  // Asignamos 'Pendiente' como estado predeterminado
                description
            });
    
            // Respondemos con la reservación creada
            res.status(201).json(newReservation);
        } catch (error) {
            console.error('Error en create:', error);
            res.status(500).json({ error: 'Error al crear la reservación' });
        }
    },
    

    // Actualizar reservación por folio
    async update(req, res) {
        try {
            const { folio } = req.params;
            const data = req.body;

            if (!folio || !data || Object.keys(data).length === 0) {
                return res.status(400).json({ error: 'Folio y datos de actualización requeridos' });
            }

            // Obtener la reservación original
            const originalReservation = await ReservationModel.getByFolio(folio);
            if (!originalReservation) {
                return res.status(404).json({ error: 'Reservación no encontrada' });
            }

            // Validar que solo administradores puedan cancelar
            if (data.status === 'Cancelada' && req.role !== 'admin') {
                return res.status(403).json({ error: 'Solo los administradores pueden cancelar una reservación' });
            }

            // Validar coherencia y disponibilidad si cambian campos críticos
            const criticalFields = ['start_time', 'end_time', 'reservation_date', 'venue_id'];
            const hasCriticalChange = criticalFields.some(
                field => data[field] && data[field] !== originalReservation[field]
            );

            if (hasCriticalChange) {
                const startTime = data.start_time || originalReservation.start_time;
                const endTime = data.end_time || originalReservation.end_time;

                if (startTime >= endTime) {
                    return res.status(400).json({ error: 'La hora de inicio debe ser menor que la hora de fin' });
                }

                const venueId = data.venue_id || originalReservation.venue_id;
                const date = data.reservation_date || originalReservation.reservation_date;

                const available = await ReservationModel.verifyAvailability(
                    venueId,
                    date,
                    startTime,
                    endTime,
                    originalReservation.folio // excluye esta misma reserva
                );

                if (!available) {
                    return res.status(409).json({ error: 'El espacio no está disponible en ese horario' });
                }
            }

            // Historial de cambios
            const historyEntries = [];
            for (const key in data) {
                if (originalReservation[key] !== data[key]) {
                    historyEntries.push({
                        user_id: req.user_id,
                        action_changed: `${key} de ${originalReservation[key]} a ${data[key]}`,
                        reservation_folio: folio
                    });
                }
            }

            for (const entry of historyEntries) {
                await ChangeHistoryModel.create(entry);
            }

            // Actualización
            const updatedReservation = await ReservationModel.updateReservationByFolio(folio, data);
            res.json(updatedReservation);

        } catch (error) {
            console.error('Error en update:', error);
            res.status(500).json({ error: 'Error al actualizar la reservación' });
        }
    },

    // Verificar disponibilidad
    async verifyAvailability(req, res) {
        try {
            const { venueId, date, startTime, endTime } = req.query;

            if (!venueId || !date || !startTime || !endTime) {
                return res.status(400).json({ error: 'Faltan parámetros para verificar disponibilidad' });
            }

            const available = await ReservationModel.verifyAvailability(
                venueId,
                date,
                startTime,
                endTime
            );

            res.json({ available });
        } catch (error) {
            console.error('Error en verifyAvailability:', error);
            res.status(500).json({ error: 'Error al verificar disponibilidad' });
        }
    }

};

module.exports = ReservationController;
