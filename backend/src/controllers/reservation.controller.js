const ReservationModel = require('../models/reservation.model');
const ChangeHistoryModel = require('../models/changeHistory.model');
const VenueModel = require('../models/venue.model');

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
            res.status(500).json({ error: 'Error al obtener la reservación' });
        }
    },

    // Obtener todas las reservaciones (excepto canceladas)
    async getAll(req, res) {
        try {
            const reservations = await ReservationModel.getAll();
            res.json(reservations);
        } catch (error) {
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
            const newReservation = await ReservationModel.create({
                requesterName,
                venueId,
                reservationDate,
                startTime,
                endTime,
                status: 'Pendiente',  // Asignamos 'Pendiente' como estado predeterminado
                description
            });
            res.status(201).json(newReservation);
        } catch (error) {
            res.status(500).json({ error: 'Error al crear la reservación' });
        }
    },

    // Función para actualizar una reservación y guardar historial de cambios
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
            if (data.status === 'Cancelada' && req.role !== 'Administrador') {
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

            // Obtener nombres de espacios si cambió venue_id
            let newVenueName = null;
            let oldVenueName = null;

            if (data.venue_id && data.venue_id !== originalReservation.venue_id) {
                const newVenue = await VenueModel.getById(data.venue_id);
                const oldVenue = await VenueModel.getById(originalReservation.venue_id);
                newVenueName = newVenue.name_venue;
                oldVenueName = oldVenue.name_venue;
            }

            // Funciones auxiliares para formato
            const formatDate = (date) => {
                const d = new Date(date);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${day}/${month}/${year}`;
            };

            const formatTime = (time) => {
                if (!time) return '';
                return time.slice(0, 5); // "HH:mm:ss" → "HH:mm"
            };

            // Mapeo a nombres amigables
            const fieldLabels = {
                start_time: 'Hora de inicio',
                end_time: 'Hora de fin',
                reservation_date: 'Fecha de reservación',
                venue_id: 'Espacio',
                status: 'Estado',
            };

            // Historial de cambios
            const historyEntries = [];
            for (const key in data) {
                if (originalReservation[key] !== data[key]) {
                    let oldValue = originalReservation[key];
                    let newValue = data[key];

                    if (key === 'start_time' || key === 'end_time') {
                        oldValue = formatTime(originalReservation[key]);
                        newValue = formatTime(data[key]);
                    } else if (key === 'reservation_date') {
                        oldValue = formatDate(originalReservation[key]);
                        newValue = formatDate(data[key]);
                    } else if (key === 'venue_id') {
                        oldValue = oldVenueName;
                        newValue = newVenueName;
                    }

                    const fieldName = fieldLabels[key] || key;

                    historyEntries.push({
                        user_id: req.user_id,
                        action_changed: `${fieldName} de ${oldValue} a ${newValue}`,
                        reservation_folio: folio
                    });
                }
            }

            for (const entry of historyEntries) {
                await ChangeHistoryModel.create(entry);
            }

            // Actualización de la reservación
            const updatedReservation = await ReservationModel.updateReservationByFolio(folio, data);
            res.json(updatedReservation);

        } catch (error) {
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
            res.status(500).json({ error: 'Error al verificar disponibilidad' });
        }
    },

    // Obtener una reservación por folio, incluyendo el estado actual y el historial de cambios
    async getByFolioForUsers(req, res) {
        const { folio } = req.params; 
        try {
            const reservationDetails = await ReservationModel.getByFolioForUsers(folio);
            if (!reservationDetails) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }
            res.json(reservationDetails);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener la reservación o el historial' });
        }
    }

};

module.exports = ReservationController;
