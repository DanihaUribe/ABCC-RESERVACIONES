// src/controllers/venue.controller.js
const Venue = require('../models/venue.model');

// Obtener todos los espacios
async function getAllVenues(req, res) {
    try {
        const venues = await Venue.getAll();
        res.status(200).json(venues);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los espacios' });
    }
}

// Obtener un espacio por ID
async function getVenueById(req, res) {
    const { id } = req.params;
    try {
        const venue = await Venue.getById(id);
        if (venue) {
            res.status(200).json(venue);
        } else {
            res.status(404).json({ message: 'Espacio no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el espacio' });
    }
}

// Crear un nuevo espacio
async function createVenue(req, res) {
    const { name_venue, capacity, description } = req.body;
    try {
        const newVenue = await Venue.create(name_venue, capacity, description);
        res.status(201).json(newVenue);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el espacio' });
    }
}

// Actualizar un espacio
async function updateVenue(req, res) {
    const { id } = req.params;
    const { name_venue, capacity, description } = req.body;
    try {
        const updatedVenue = await Venue.update(id, name_venue, capacity, description);
        if (updatedVenue) {
            res.status(200).json(updatedVenue);
        } else {
            res.status(404).json({ message: 'Espacio no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el espacio' });
    }
}

module.exports = {
    getAllVenues,
    getVenueById,
    createVenue,
    updateVenue
};
