'use strict';
export const createAccount = async (req, res) => {
    try {
        const { externalUserId } = req.body;

        if (!externalUserId)
            return res.status(400).json({
                message: 'External user id is required'
            });

        const accountNumber = await generateAccountNumber();

        const account = await Account.create({
            accountNumber,
            externalUserId,
            balance: 0
        });

        return res.status(201).json(account);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
};

/* ===============================
   OBTENER TODAS LAS CUENTAS
export const getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find();
        return res.json(accounts);
    } catch (error) {
        return res.status(500).json({
import { convertCurrency } from "./currency.service.js";
import Account from './accounts.model.js';
import Product from '../products/products.model.js';
import Transaction from '../transactions/transaction.model.js';
export const purchaseWithPoints = async (req, res) => {
    try {
        const { accountId, productId } = req.body;

        // Buscar cuenta
        const account = await Account.findById(accountId);
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        if (!account.isActive || account.status !== "ACTIVE") {
            return res.status(400).json({ message: "Account is not active" });
        }


        // Buscar producto
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({
                message: "Product not found or inactive"
            });
        }

        const price = product.price;

        // Verificar puntos suficientes
        if (account.points < price) {
            return res.status(400).json({
                message: "Not enough points"
            });
        }

        // Restar puntos
        account.points -= price;
        await account.save();

        // Crear transacción
        const transaction = await Transaction.create({
            type: "POINT_PURCHASE",
            amount: price,
            sourceAccount: account._id,
            description: `Purchase with points: ${product.name}`,
            product: product._id,
            isReversible: false,
            isReversed: false,
            isActive: true
        });

        return res.status(200).json({
            success: true,
            message: "Product purchased successfully with points",
            product: product.name,
            remainingPoints: account.points,
            transaction
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};
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

        if (
            req.user.role !== 'ADMIN_ROLE' &&
            account.externalUserId !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "No tienes permiso sobre esta cuenta"
            });
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

export const getAccountByNumber = async (req, res) => {
    try {
        const { accountNumber } = req.params;

        const account = await Account.findOne({ accountNumber });

        if (!account)
            return res.status(404).json({
                message: 'Account not found'
            });

        return res.json(account);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

/* ===============================
   DEPOSITAR
export const deposit = async (req, res) => {
    try {
        const { accountNumber } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0)
            return res.status(400).json({
                message: 'Amount must be greater than 0'
            });

        const account = await Account.findOne({ accountNumber });

        if (!account)
            return res.status(404).json({
                message: 'Account not found'
            });

        if (account.status !== 'ACTIVE')
            return res.status(400).json({
                message: 'Account is not active'
            });

        account.balance += Number(amount);
        await account.save();

        return res.json({
            message: 'Deposit successful',
            account
// Función para generar número de cuenta automáticamente
const generateAccountNumber = () => {
    const entityCode = '1008'; 
    const randomNumber = Math.floor(Math.random() * 9000000000) + 1000000000; // 10 dígitos aleatorios
    return `${entityCode}${randomNumber}`;
};

export const createAccount = async (req, res) => {
    try {
        // Nota: El chequeo de 'ADMIN_ROLE' ya lo hace el middleware arriba, 
        // pero dejarlo aquí es una buena segunda capa de seguridad.

        const { externalUserId, balance, accountNumber: customNumber } = req.body;

        // 1. Generar número o usar el proporcionado
        const accountNumber = customNumber || generateAccountNumber();

        // 2. Crear la cuenta asignándola al usuario que viene en el BODY, no al Admin
        const account = new Account({
            externalUserId, // ID del cliente
            accountNumber,
            balance: balance || 0,
            status: 'ACTIVE'
        });

        await account.save();

        return res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente por el administrador',
            account
        });

    } catch (error) {
        // Manejo específico para números de cuenta duplicados
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'El número de cuenta ya existe'
            });
        }
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
export const withdraw = async (req, res) => {
    try {
        const { accountNumber } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0)
            return res.status(400).json({
                message: 'Amount must be greater than 0'
            });

        const account = await Account.findOne({ accountNumber });

        if (!account)
            return res.status(404).json({
                message: 'Account not found'
            });

        if (account.status !== 'ACTIVE')
            return res.status(400).json({
                message: 'Account is not active'
            });

        if (account.balance < amount)
            return res.status(400).json({
                message: 'Insufficient funds'
            });

        account.balance -= Number(amount);
        await account.save();

        return res.json({
            message: 'Withdraw successful',
            account
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
export const deleteAccount = async (req, res) => {
    try {
        const { accountNumber } = req.params;

        const deleted = await Account.findOneAndDelete({ accountNumber });

        if (!deleted)
            return res.status(404).json({
                message: 'Account not found'
            });

        return res.json({
            message: 'Account deleted'
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
/* ===============================
   TRANSFERENCIA
export const transfer = async (req, res) => {
    try {
        const { fromAccountNumber, toAccountNumber, amount } = req.body;

        if (!fromAccountNumber || !toAccountNumber || !amount)
            return res.status(400).json({
                message: 'All fields are required'
            });

        if (amount <= 0)
            return res.status(400).json({
                message: 'Amount must be greater than 0'
            });

        const fromAccount = await Account.findOne({ accountNumber: fromAccountNumber });
        const toAccount = await Account.findOne({ accountNumber: toAccountNumber });

        if (!fromAccount)
            return res.status(404).json({
                message: 'Origin account not found'
            });

        if (!toAccount)
            return res.status(404).json({
                message: 'Destination account not found'
            });

        if (fromAccount.status !== 'ACTIVE' || toAccount.status !== 'ACTIVE')
            return res.status(400).json({
                message: 'One of the accounts is not active'
            });

        if (fromAccount.balance < amount)
            return res.status(400).json({
                message: 'Insufficient funds'
            });

        // Transfer logic
        fromAccount.balance -= Number(amount);
        toAccount.balance += Number(amount);

        await fromAccount.save();
        await toAccount.save();

        return res.json({
            message: 'Transfer successful',
            fromAccount,
            toAccount
            success: false,
            message: 'Error al eliminar la cuenta',
            error: error.message
        });
    }
};

export const getMyAccounts = async (req, res) => {
    try {

        let accounts;

        if (req.user.role === 'ADMIN_ROLE') {
            accounts = await Account.find({ isActive: true });

        } else {
            accounts = await Account.find({
                externalUserId: req.user.id,
                isActive: true
            });
        }

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