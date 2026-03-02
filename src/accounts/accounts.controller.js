'use strict';
import { convertCurrency } from "./currency.service.js";
import Account from './accounts.model.js';
export const convertBalance = async (req, res) => {
    try {
        const { id } = req.params;
        let { to } = req.query;

        if (!to) {
            return res.status(400).json({
                success: false,
                message: "Debes indicar la moneda destino ?to=USD o ?to=USD,EUR,JPY"
            });
        }

        to = to.split(',').map(curr => curr.trim().toUpperCase());

        const account = await Account.findById(id);

        if (!account) {
            return res.status(404).json({ success: false, message: "Cuenta no encontrada" });
        }

        if (account.externalUserId !== req.user.id) {
            return res.status(403).json({ success: false, message: "No tienes permiso sobre esta cuenta" });
        }

        const converted = await convertCurrency(account.balance, "GTQ", to);

        return res.json({
            success: true,
            saldoOriginal: account.balance,
            monedaOrigen: "GTQ",
            monedaDestino: to,
            saldoConvertido: converted
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Función para generar número de cuenta automáticamente
const generateAccountNumber = () => {
    const entityCode = '1008'; 
    const randomNumber = Math.floor(Math.random() * 9000000000) + 1000000000; // 10 dígitos aleatorios
    return `${entityCode}${randomNumber}`;
};

export const createAccount = async (req, res) => {
    try {

        const data = req.body;

        // Generar número de cuenta automáticamente si no se proporciona
        const accountNumber = data.accountNumber || generateAccountNumber();

        const account = new Account({
            ...data,
            accountNumber,
            status: 'ACTIVE',
            externalUserId: req.user.id 
        });

        await account.save();

        return res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente',
            account
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear la cuenta',
            error: error.message
        });
    }
};

export const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const account = await Account.findById(id);

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        if (account.externalUserId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para editar esta cuenta'
            });
        }

        const updated = await Account.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );

        return res.json({
            success: true,
            message: 'Cuenta actualizada',
            updated
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar la cuenta',
            error: error.message
        });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;

        const account = await Account.findById(id);

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        if (account.externalUserId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar esta cuenta'
            });
        }

        await Account.findByIdAndUpdate(id, { 
            isActive: false, 
            status: 'CLOSED' 
        });

        return res.json({
            success: true,
            message: 'Cuenta cerrada/desactivada correctamente'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar la cuenta',
            error: error.message
        });
    }
};

export const getMyAccounts = async (req, res) => {
    try {
        const accounts = await Account.find({ 
            externalUserId: req.user.id, 
            isActive: true 
        });

        return res.json({
            success: true,
            accounts
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las cuentas',
            error: error.message
        });
    }
};
