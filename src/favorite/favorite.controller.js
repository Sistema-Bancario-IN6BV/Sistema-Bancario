'use strict';

import Favorite from './favorite.model.js';
import Account from '../accounts/accounts.model.js';

export const addFavorite = async (req, res) => {
    try {
        const data = req.body;

        const accountExists = await Account.findById(data.accountId);
        if (!accountExists) {
            return res.status(404).json({
                success: false,
                message: 'La cuenta que intentas agregar no existe'
            });
        }

        const favorite = new Favorite({
            ...data,
            externalUserId: req.user.id
        });

        await favorite.save();

        return res.status(201).json({
            success: true,
            message: 'Cuenta agregada a favoritos',
            favorite
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al agregar favorito',
            error: error.message
        });
    }
};

export const updateFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const { alias } = req.body;

        const favorite = await Favorite.findById(id);

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado'
            });
        }

        if (favorite.externalUserId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para editar este favorito'
            });
        }

        const updated = await Favorite.findByIdAndUpdate(
            id,
            { alias },
            { new: true, runValidators: true }
        );

        return res.json({
            success: true,
            message: 'Alias del favorito actualizado',
            updated
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar favorito',
            error: error.message
        });
    }
};

export const deleteFavorite = async (req, res) => {
    try {
        const { id } = req.params;

        const favorite = await Favorite.findById(id);

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado'
            });
        }

        if (favorite.externalUserId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar este favorito'
            });
        }

        await Favorite.findByIdAndUpdate(id, { isActive: false });

        return res.json({
            success: true,
            message: 'Favorito eliminado de tu lista'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar favorito',
            error: error.message
        });
    }
};

export const getMyFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ 
            externalUserId: req.user.id, 
            isActive: true 
        }).populate('accountId', 'accountNumber status'); 

        return res.json({
            success: true,
            favorites
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener favoritos',
            error: error.message
        });
    }
};

export const changeFavoriteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';

        const favorite = await Favorite.findByIdAndUpdate(
            id, 
            { isActive },
            { new: true}
        );

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: `Favorito no encontrado`,
            });
        }

        res.status(200).json({
            success: true,
            message: `Favorito ${action} exitosamente`,
            data: favorite
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del favorito',
            error: error.message,
        });
        
    }
}