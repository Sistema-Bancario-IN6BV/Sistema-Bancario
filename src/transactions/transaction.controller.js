'use strict';

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
            message: 'Error al crear transacción',
            error: error.message
        });
    }
};

// Obtener transacciones
export const getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, type } = req.query;

        const filter = type ? { type } : {};

        const transactions = await Transaction.find(filter)
            .populate('sourceAccount')
            .populate('destinationAccount')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

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
            message: 'Error al obtener transacciones',
            error: error.message
        });
    }
};

// Obtener por ID
export const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id)
            .populate('sourceAccount')
            .populate('destinationAccount');

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
            message: 'Error al obtener transacción',
            error: error.message
        });
    }
};

// Actualizar transacción
export const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTransaction) {
            return res.status(404).json({
                success: false,
                message: 'Transacción no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Transacción actualizada exitosamente',
            data: updatedTransaction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar transacción',
            error: error.message
        });
    }
};

// Reversar transacción
export const reverseTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transacción no encontrada'
            });
        }

        if (!transaction.isReversible) {
            return res.status(400).json({
                success: false,
                message: 'Esta transacción no se puede reversar'
            });
        }

        if (transaction.isReversed) {
            return res.status(400).json({
                success: false,
                message: 'La transacción ya fue reversada'
            });
        }

        transaction.isReversed = true;
        await transaction.save();

        res.status(200).json({
            success: true,
            message: 'Transacción reversada exitosamente',
            data: transaction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al reversar transacción',
            error: error.message
        });
    }
};
