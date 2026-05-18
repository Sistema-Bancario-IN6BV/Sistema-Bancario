'use strict';

import Account from './accounts.model.js';
import AccountRequest from './account-request.model.js';
import Product from '../products/products.model.js';
import Transaction from '../transactions/transaction.model.js';
import { convertCurrency } from './currency.service.js';

const generateAccountNumber = () => {
    const entityCode = '1008';
    const randomNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
    return `${entityCode}${randomNumber}`;
};

const generateUniqueAccountNumber = async () => {
    let accountNumber = generateAccountNumber();

    while (await Account.exists({ accountNumber })) {
        accountNumber = generateAccountNumber();
    }

    return accountNumber;
};

const hasActiveAccount = async (externalUserId) => {
    return Account.exists({ externalUserId, isActive: true });
};

const hasAnyAccount = async (externalUserId) => {
    return Account.exists({ externalUserId });
};

const hasPendingAccountRequest = async (externalUserId) => {
    return AccountRequest.exists({ externalUserId, status: 'PENDING' });
};

const canAccessAccount = (account, user) => {
    if (!account || !user) {
        return false;
    }

    if (user.role === 'ADMIN_ROLE') {
        return true;
    }

    return String(account.externalUserId) === String(user.id);
};

export const createAccount = async (req, res) => {
    try {
        const { externalUserId, balance, accountNumber: customNumber, status } = req.body;
        const targetUserId = externalUserId || req.user?.id;

        if (!targetUserId) {
            return res.status(400).json({ message: 'External user id is required' });
        }

        if (await hasAnyAccount(targetUserId)) {
            return res.status(409).json({ message: 'El usuario ya tiene una cuenta registrada' });
        }

        if (await hasPendingAccountRequest(targetUserId)) {
            return res.status(409).json({ message: 'El usuario ya tiene una solicitud pendiente' });
        }

        const account = await Account.create({
            externalUserId: targetUserId,
            accountNumber: customNumber || await generateUniqueAccountNumber(),
            balance: Number(balance ?? 0),
            status: status || 'ACTIVE',
            isActive: true,
        });

        return res.status(201).json(account);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

export const requestAccount = async (req, res) => {
    try {
        const externalUserId = req.user?.id;

        if (!externalUserId) {
            return res.status(400).json({ message: 'Usuario no válido' });
        }

        if (await hasAnyAccount(externalUserId)) {
            return res.status(409).json({ message: 'Ya tienes una cuenta registrada' });
        }

        if (await hasPendingAccountRequest(externalUserId)) {
            return res.status(409).json({ message: 'Ya tienes una solicitud pendiente' });
        }

        const request = await AccountRequest.create({
            externalUserId,
            status: 'PENDING',
        });

        return res.status(201).json({ success: true, request });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getMyAccountRequests = async (req, res) => {
    try {
        const requests = await AccountRequest.find({ externalUserId: req.user?.id }).sort({ createdAt: -1 });
        return res.json({ requests });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getMyAccountSummary = async (req, res) => {
    try {
        const externalUserId = req.user?.id;

        const [totalAccounts, activeAccounts, pendingRequests] = await Promise.all([
            Account.countDocuments({ externalUserId }),
            Account.countDocuments({ externalUserId, isActive: true }),
            AccountRequest.countDocuments({ externalUserId, status: 'PENDING' }),
        ]);

        return res.json({
            totalAccounts,
            activeAccounts,
            pendingRequests,
            hasAnyAccount: totalAccounts > 0,
            hasPendingRequest: pendingRequests > 0,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getPendingAccountRequests = async (req, res) => {
    try {
        const requests = await AccountRequest.find({ status: 'PENDING' }).sort({ createdAt: -1 });
        return res.json({ requests });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const approveAccountRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await AccountRequest.findById(id);

        if (!request) {
            return res.status(404).json({ message: 'Account request not found' });
        }

        if (request.status !== 'PENDING') {
            return res.status(409).json({ message: 'La solicitud ya fue procesada' });
        }

        if (await hasAnyAccount(request.externalUserId)) {
            request.status = 'REJECTED';
            request.reviewedBy = req.user?.id || null;
            request.reviewedAt = new Date();
            request.reviewNote = 'El usuario ya tiene una cuenta registrada';
            await request.save();

            return res.status(409).json({ message: 'El usuario ya tiene una cuenta registrada' });
        }

        const account = await Account.create({
            externalUserId: request.externalUserId,
            accountNumber: await generateUniqueAccountNumber(),
            balance: 0,
            status: 'ACTIVE',
            isActive: true,
        });

        request.status = 'APPROVED';
        request.reviewedBy = req.user?.id || null;
        request.reviewedAt = new Date();
        request.accountId = account._id.toString();
        await request.save();

        return res.status(200).json({ success: true, request, account });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const rejectAccountRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { reviewNote } = req.body || {};
        const request = await AccountRequest.findById(id);

        if (!request) {
            return res.status(404).json({ message: 'Account request not found' });
        }

        if (request.status !== 'PENDING') {
            return res.status(409).json({ message: 'La solicitud ya fue procesada' });
        }

        request.status = 'REJECTED';
        request.reviewedBy = req.user?.id || null;
        request.reviewedAt = new Date();
        request.reviewNote = reviewNote || 'Solicitud rechazada por el administrador';
        await request.save();

        return res.status(200).json({ success: true, request });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getMyAccounts = async (req, res) => {
    try {
        const filter = req.user?.role === 'ADMIN_ROLE'
            ? {}
            : { externalUserId: req.user?.id, isActive: true };

        const accounts = await Account.find(filter).sort({ createdAt: -1 });
        return res.json(accounts);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { balance, status } = req.body;

        const account = await Account.findById(id);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Only admins can perform arbitrary updates to account fields
        if (req.user?.role !== 'ADMIN_ROLE') {
            return res.status(403).json({ message: 'Solo administradores pueden actualizar cuentas' });
        }

        if (balance !== undefined) {
            account.balance = Number(balance);
        }

        if (status) {
            account.status = status;
            account.isActive = status === 'ACTIVE';
        }

        await account.save();
        return res.json(account);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const account = await Account.findById(id);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        if (!canAccessAccount(account, req.user)) {
            return res.status(403).json({ message: 'No tienes permiso sobre esta cuenta' });
        }

        account.isActive = false;
        account.status = 'CLOSED';
        await account.save();

        return res.json({ message: 'Account deleted successfully', account });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const changeAccountStatus = async (req, res) => {
    try {
        const { id, status } = req.params;
        const allowedStatuses = ['ACTIVE', 'BLOCKED', 'CLOSED'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid account status' });
        }

        const account = await Account.findById(id);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Only admins can change arbitrary statuses.
        // A regular user may only deactivate (close) their own account.
        if (req.user?.role === 'ADMIN_ROLE') {
            account.status = status;
            account.isActive = status === 'ACTIVE';
            await account.save();
            return res.json(account);
        }

        // Not admin: check ownership
        if (String(account.externalUserId) !== String(req.user?.id)) {
            return res.status(403).json({ message: 'No tienes permiso sobre esta cuenta' });
        }

        // Allow owners only to CLOSE their own account (deactivate)
        if (status !== 'CLOSED') {
            return res.status(403).json({ message: 'Solo administradores pueden cambiar este estado' });
        }

        account.status = 'CLOSED';
        account.isActive = false;
        await account.save();

        return res.json(account);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getAccountWithMovements = async (req, res) => {
    try {
        const { id } = req.params;
        const account = await Account.findById(id);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        if (!canAccessAccount(account, req.user)) {
            return res.status(403).json({ message: 'No tienes permiso sobre esta cuenta' });
        }

        const movements = await Transaction.find({
            $or: [
                { sourceAccount: account._id },
                { destinationAccount: account._id }
            ]
        }).sort({ createdAt: -1 });

        return res.json({ account, movements });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const purchaseWithPoints = async (req, res) => {
    try {
        const { accountId, productId } = req.body;

        const account = await Account.findById(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        if (!canAccessAccount(account, req.user)) {
            return res.status(403).json({ message: 'No tienes permiso sobre esta cuenta' });
        }

        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({ message: 'Product not found or inactive' });
        }

        const price = Number(product.price);
        if ((account.points || 0) < price) {
            return res.status(400).json({ message: 'Not enough points' });
        }

        account.points = (account.points || 0) - price;
        await account.save();

        const transaction = await Transaction.create({
            type: 'POINT_PURCHASE',
            amount: price,
            sourceAccount: account._id,
            description: `Purchase with points: ${product.name}`,
            isReversible: false,
            isReversed: false,
            isActive: true,
        });

        return res.status(200).json({
            success: true,
            message: 'Product purchased successfully with points',
            product: product.name,
            remainingPoints: account.points,
            transaction,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const convertBalance = async (req, res) => {
    try {
        const { id } = req.params;
        let { to } = req.query;

        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Debes indicar la moneda destino ?to=USD o ?to=USD,EUR,JPY'
            });
        }

        to = to.split(',').map((curr) => curr.trim().toUpperCase());

        const account = await Account.findById(id);

        if (!account) {
            return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
        }

        if (!canAccessAccount(account, req.user)) {
            return res.status(403).json({ success: false, message: 'No tienes permiso sobre esta cuenta' });
        }

        const converted = await convertCurrency(account.balance, 'GTQ', to);

        return res.json({
            success: true,
            saldoOriginal: account.balance,
            monedaOrigen: 'GTQ',
            monedaDestino: to,
            saldoConvertido: converted,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};