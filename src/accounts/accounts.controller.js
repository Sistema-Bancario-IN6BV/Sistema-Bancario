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

        if (req.user.role != 'ADMIN_ROLE'){
            return res.status(403).json({
                success: false,
                message: 'Only admins can create accounts'
            });

        };

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

        if (req.user.role != 'ADMIN_ROLE'){
            return res.status(403).json({
                success: false,
                message: 'Only admins can delete accounts'
            });

        };

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

        if (req.user.role != 'ADMIN_ROLE'){
            return res.status(403).json({
                success: false,
                message: 'Only admins can see accounts'
            });

        };

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

export const changeAccountStatus = async (req, res) => {
    try {
        const { id, status } = req.params;

        const allStatus = ['ACTIVE', 'BLOCKED', 'CLOSED'];

        if (!allStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const updateData = {
            status,
            isActive: status === 'ACTIVE'
        };

        const account = await Account.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Account updated to status ${status}`,
            data: account
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating account status',
            error: error.message
        });
    }
};

export const getAccountWithMovements = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN_ROLE') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can view account details'
            });
        }

        const { id } = req.params;

        const account = await Account.findById(id);

        if (!account || !account.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        const lastMovements = await Transaction.find({
            $or: [
                { sourceAccount: account._id },
                { destinationAccount: account._id }
            ],
            isActive: true
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

        return res.json({
            success: true,
            message: 'Account details with last 5 movements',
            account: {
                accountId: account._id,
                accountNumber: account.accountNumber,
                balance: account.balance,
                status: account.status,
                userId: account.externalUserId,
                lastMovements: lastMovements.map(movement => ({
                    _id: movement._id,
                    type: movement.type,
                    amount: movement.amount,
                    description: movement.description,
                    createdAt: movement.createdAt
                }))
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching account details',
            error: error.message
        });
    }
};