
import Transaction from './transaction.model.js';
// Crear transacción
export const createTransaction = async (req, res) => {
    try {
        const data = req.body;

        const transaction = new Transaction(data);
        await transaction.save();

        res.status(201).json({
            success: true,
            message: 'Transacción creada exitosamente',
            data: transaction
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la cuenta',
            error: error.message
        });
    }
};

// Obtener Transacciones
export const getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10,  isActive = true} = req.query;

        const filter = { isActive };

        const transactions = await Transaction.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);

        const total = await Transaction.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: transactions,
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

// Obtener transacción por ID
export const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transacción no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: transaction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la transacción',
            error: error.message
        });
    }
};

// Actualizar transacción
export const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const currentTransaction = await Transaction.findById(id);
        if (!currentTransaction) {
            return res.status(404).json({
                success: false,
                message: "Transacción no encontrada",
            });
        }

        const updateData = { ...req.body };


        const updatedTransaction = await Transaction.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Transacción actualizada exitosamente",
            data: updatedTransaction,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar campo",
            error: error.message,
        });
    }
};

export const changeTransactionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        // Detectar si es activate o deactivate desde la URL
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';

        const transaction = await Transaction.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transacción no encontrada',
            });
        }

        res.status(200).json({
            success: true,
            message: `Transacción ${action} exitosamente`,
            data: transaction,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado de la transacción',
            error: error.message,
        });
    }
};
