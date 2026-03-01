
import Transaction from './transaction.model.js';
import Account from '../accounts/accounts.model.js';

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

// Revertir transacción (depósito)
export const reverseTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Buscar la transacción original
        const originalTransaction = await Transaction.findById(id);
        
        if (!originalTransaction) {
            return res.status(404).json({
                success: false,
                message: 'Transacción no encontrada'
            });
        }

        // 2. Validar que es un depósito
        if (originalTransaction.type !== 'DEPOSIT') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden revertir transacciones de tipo DEPOSIT'
            });
        }

        // 3. Validar que no esté ya revertida
        if (originalTransaction.isReversed) {
            return res.status(400).json({
                success: false,
                message: 'Esta transacción ya ha sido revertida'
            });
        }

        // 4. Validar que sea reversible (opcional, dependiendo de requisitos del negocio)
        // Por defecto asumimos que todo depósito es reversible, pero puedes habilitar esta validación
        // if (!originalTransaction.isReversible) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Esta transacción no es reversible'
        //     });
        // }

        // 5. Obtener la cuenta afectada
        // Para depósitos, el destinationAccount recibe el dinero
        const accountId = originalTransaction.destinationAccount;
        
        if (!accountId) {
            return res.status(400).json({
                success: false,
                message: 'La transacción no tiene cuenta de destino asociada'
            });
        }

        const account = await Account.findById(accountId);
        
        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        // 6. Validar que la cuenta tenga saldo suficiente para revertir
        if (account.balance < originalTransaction.amount) {
            return res.status(400).json({
                success: false,
                message: 'Saldo insuficiente para revertir la transacción'
            });
        }

        // 7. Iniciar sesión de MongoDB para transacción atómica
        const session = await require('mongoose').startSession();
        session.startTransaction();

        try {
            // 8. Crear la transacción de reversión
            const reversalTransaction = new Transaction({
                type: 'REVERSAL',
                amount: originalTransaction.amount,
                sourceAccount: originalTransaction.destinationAccount, // Misma cuenta como origen
                destinationAccount: null,
                description: `Reversión de transacción: ${originalTransaction._id}. Razón: ${req.body.reason || 'No especificada'}`,
                isReversible: false,
                isReversed: false,
                isActive: true
            });

            await reversalTransaction.save({ session });

            // 9. Actualizar la transacción original
            originalTransaction.isReversed = true;
            await originalTransaction.save({ session });

            // 10. Ajustar el saldo de la cuenta (restar el monto)
            account.balance -= originalTransaction.amount;
            await account.save({ session });

            // 11. Confirmar la transacción
            await session.commitTransaction();
            session.endSession();

            res.status(200).json({
                success: true,
                message: 'Depósito revertido exitosamente',
                data: {
                    originalTransaction: originalTransaction,
                    reversalTransaction: reversalTransaction,
                    accountBalance: account.balance
                }
            });

        } catch (error) {
            // Revertir la transacción si algo falla
            await session.abortTransaction();
            session.endSession();
            throw error;
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al revertir la transacción',
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
