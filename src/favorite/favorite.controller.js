
import Favorite from './favorite.model.js'
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
            message: 'Error al crear la cuenta',
            error: error.message
        });
    }
};

// Obtener Favoritos
export const getFavorites = async (req, res) => {
    try {
        const { page = 1, limit = 10,  isActive = true} = req.query;

        const filter = { isActive };

        const fields = await Field.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);

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
            message: 'Error al obtener las cuentas',
            error: error.message
        });
    }
};

// Obtener favorito por ID
export const getFavoriteById = async (req, res) => {
    try {
        const { id } = req.params;

        const favorite = await Favorite.findById(id);
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
            message: 'Error al obtener la cuenta',
            error: error.message
        });
    }
};

// Actualizar favorito
export const updateFavorite = async (req, res) => {
    try {
        const { id } = req.params;

        const currentFavorite = await Favorite.findById(id);
        if (!currentFavorite) {
            return res.status(404).json({
                success: false,
                message: "Campo no encontrado",
            });
        }

        const updateData = { ...req.body };


        const updatedFavorite = await Favorite.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Campo actualizado exitosamente",
            data: updatedField,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar campo",
            error: error.message,
        });
    }
};

export const changeFavoriteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        // Detectar si es activate o deactivate desde la URL
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';

        const favorite = await Favorite.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado',
            });
        }

        res.status(200).json({
            success: true,
            message: `Favorito ${action} exitosamente`,
            data: favorite,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del favorito',
            error: error.message,
        });
    }
};
