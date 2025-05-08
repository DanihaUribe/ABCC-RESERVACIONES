const ChangeHistoryModel = require('../models/changeHistory.model');

const ChangeHistoryController = {

    // Crear un nuevo registro de historial de cambios
    async createChangeHistory(req, res) {
        try {
            const { user_id, action_changed, reservation_folio } = req.body;

            if (!user_id || !action_changed || !reservation_folio) {
                return res.status(400).json({ error: 'Faltan parámetros: user_id, action_changed y reservation_folio' });
            }

            const newHistory = await ChangeHistoryModel.create({
                user_id,
                action_changed,
                reservation_folio
            });

            res.status(201).json(newHistory);

        } catch (error) {
            console.error('Error al crear el historial de cambios:', error);
            res.status(500).json({ error: 'Error al crear el historial de cambios' });
        }
    },

    // Obtener historial de cambios por folio
    async getChangeHistoryByFolio(req, res) {
        try {
            const { folio } = req.params;
            const history = await ChangeHistoryModel.getByFolio(folio);

            if (history.length === 0) {
                return res.status(404).json({ error: 'No se encontraron registros de historial para este folio' });
            }

            res.json(history);
        } catch (error) {
            console.error('Error al obtener el historial de cambios:', error);
            res.status(500).json({ error: 'Error al obtener el historial de cambios' });
        }
    }
};

module.exports = ChangeHistoryController;





