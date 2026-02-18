
import Account from './account.model.js';
// Crear cuenta
export const createAccount = async (req, res) => {
    try {
        const data = req.body;

        const account = new Account(data);
        await account.save();

        res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente',
            data: account
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la cuenta',
            error: error.message
        });
    }
};

// Obtener Cuentas
export const getAccounts = async (req, res) => {
    try {
        const { page = 1, limit = 10,  isActive = true} = req.query;

        const filter = { isActive };

        const fields = await Field.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);

        const total = await Account.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: accounts,
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

// Obtener campo por ID
export const getAccountById = async (req, res) => {
    try {
        const { id } = req.params;

        const account = await Account.findById(id);

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: account
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la cuenta',
            error: error.message
        });
    }
};

// Actualizar campo
export const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;

        const currentField = await Field.findById(id);
        if (!currentField) {
            return res.status(404).json({
                success: false,
                message: "Campo no encontrado",
            });
        }

        const updateData = { ...req.body };


        const updatedAccount = await Account.findByIdAndUpdate(id, updateData, {
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

export const changeAccountStatus = async (req, res) => {
    try {
        const { id } = req.params;
        // Detectar si es activate o deactivate desde la URL
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';

        const account = await Account.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada',
            });
        }

        res.status(200).json({
            success: true,
            message: `Campo ${action} exitosamente`,
            data: field,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del campo',
            error: error.message,
        });
    }
};
