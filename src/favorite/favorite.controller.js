'use strict';

import Favorite from './favorite.model.js';

// Crear favorito
export const createFavorite = async (req, res) => {
    try {
        const data = req.body;

        const favorite = new Favorite(data);
        await favorite.save();

        res.status(201).json({
            success: true,
            message: 'Favorito creado exitosamente',
            data: favorite
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear favorito',
            error: error.message
        });
    }
};

// Obtener favoritos
export const getFavorites = async (req, res) => {
    try {
        const { page = 1, limit = 10, externalUserId } = req.query;

        const filter = externalUserId ? { externalUserId } : {};

        const favorites = await Favorite.find(filter)
            .populate('accountId') // 🔗 trae datos de la cuenta
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Favorite.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: favorites,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener favoritos',
            error: error.message
        });
    }
};

// Obtener campo por ID
export const getFavoriteById = async (req, res) => {
    try {
        const { id } = req.params;

        const favorite = await Favorite.findById(id).populate('accountId');

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: favorite
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener favorito',
            error: error.message
        });
    }
};

// Actualizar favorito
export const updateFavorite = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedFavorite = await Favorite.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedFavorite) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Favorito actualizado exitosamente',
            data: updatedFavorite
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar favorito',
            error: error.message
        });
    }
};

export const deleteFavorite = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedFavorite = await Favorite.findByIdAndDelete(id);

        if (!deletedFavorite) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Favorito eliminado exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar favorito',
            error: error.message
        });
    }
};
