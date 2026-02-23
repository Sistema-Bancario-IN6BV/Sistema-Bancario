'use strict';

import Account from './accounts.model.js';

// Crear cuenta
export const createAccount = async (req, res) => {
    try {
        const { balance, externalUserId } = req.body;

        if (!externalUserId) {
            return res.status(400).json({
                message: 'External user id is required'
            });
        }

        if (balance < 100) {
            return res.status(400).json({
                message: 'El ingreso mínimo es Q100'
            });
        }

        const accountNumber = Math.floor(
            1000000000 + Math.random() * 9000000000
        ).toString();

        const account = new Account({
            accountNumber,
            balance,
            externalUserId
        });

        await account.save();

        return res.status(201).json({
            message: 'Cuenta creada',
            account
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Error al crear cuenta',
            err
        });
    }
};

// Obtener todas las cuentas
export const getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find();
        return res.status(200).json(accounts);
    } catch (err) {
        return res.status(500).json({
            message: 'Error al obtener cuentas',
            err
        });
    }
};

// Obtener cuenta por número
export const getAccountByNumber = async (req, res) => {
    try {
        const { accountNumber } = req.params;

        const account = await Account.findOne({ accountNumber });

        if (!account) {
            return res.status(404).json({
                message: 'Cuenta no encontrada'
            });
        }

        return res.status(200).json(account);

    } catch (err) {
        return res.status(500).json({
            message: 'Error al buscar cuenta',
            err
        });
    }
};

// Depositar
export const deposit = async (req, res) => {
    try {
        const { accountNumber } = req.params;
        const { amount } = req.body;

        const account = await Account.findOne({ accountNumber });

        if (!account) {
            return res.status(404).json({
                message: 'Cuenta no encontrada'
            });
        }

        account.balance += amount;
        await account.save();

        return res.status(200).json({
            message: 'Depósito exitoso',
            account
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Error al depositar',
            err
        });
    }
};

// Retirar
export const withdraw = async (req, res) => {
    try {
        const { accountNumber } = req.params;
        const { amount } = req.body;

        const account = await Account.findOne({ accountNumber });

        if (!account) {
            return res.status(404).json({
                message: 'Cuenta no encontrada'
            });
        }

        if (account.balance < amount) {
            return res.status(400).json({
                message: 'Fondos insuficientes'
            });
        }

        account.balance -= amount;
        await account.save();

        return res.status(200).json({
            message: 'Retiro exitoso',
            account
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Error al retirar',
            err
        });
    }
};

// Eliminar cuenta
export const deleteAccount = async (req, res) => {
    try {
        const { accountNumber } = req.params;

        await Account.findOneAndDelete({ accountNumber });

        return res.status(200).json({
            message: 'Cuenta eliminada'
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Error al eliminar cuenta',
            err
        });
    }
};