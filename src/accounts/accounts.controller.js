'use strict';

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
        const { page = 1, limit = 10, status } = req.query;

        const filter = status ? { status } : {};

        const accounts = await Account.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

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

        const updatedAccount = await Account.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedAccount) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cuenta actualizada exitosamente',
            data: updatedAccount
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la cuenta',
            error: error.message
        });
    }
};

export const changeAccountStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const account = await Account.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Estado actualizado correctamente',
            data: account
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado',
            error: error.message
        });
    }
};
