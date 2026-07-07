'use strict';

import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import Transaction from './transaction.model.js';
import Account from '../accounts/accounts.model.js';
import Favorite from '../favorite/favorite.model.js';

export const createTransaction = async (req, res) => {
    try {

        const { type, amount, sourceAccount, destinationAccount, favoriteId, description } = req.body;
        const normalizeAccountReference = (value) => String(value ?? '').trim().replace(/[\s-]+/g, '');
        const isObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value ?? '').trim());
        const resolveAccount = async (reference) => {
            const normalizedReference = normalizeAccountReference(reference);

            if (!normalizedReference) {
                return null;
            }

            if (isObjectId(normalizedReference)) {
                const byId = await Account.findById(normalizedReference);
                if (byId) {
                    return byId;
                }
            }

            return Account.findOne({ accountNumber: normalizedReference });
        };

        if (!type || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Type and amount are required'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        let source = null;
        let destination = null;

        if (sourceAccount) {
            source = await resolveAccount(sourceAccount);

            if (!source || !source.isActive || source.status !== 'ACTIVE') {
                return res.status(404).json({
                    success: false,
                    message: 'Source account not found or inactive'
                });
            }
        }

        if (destinationAccount) {
            destination = await resolveAccount(destinationAccount);

            if (!destination || !destination.isActive || destination.status !== 'ACTIVE') {
                return res.status(404).json({
                    success: false,
                    message: 'Destination account not found or inactive'
                });
            }
        }

        // If a favorite is provided instead of a raw destination account, resolve it
        if (!destination && favoriteId) {
            const fav = isObjectId(favoriteId)
                ? await Favorite.findById(favoriteId)
                : await Favorite.findOne({ _id: favoriteId });
            if (!fav || !fav.isActive) {
                return res.status(404).json({ success: false, message: 'Favorite not found or inactive' });
            }
            destination = await resolveAccount(fav.accountId);

            if (!destination || !destination.isActive || destination.status !== 'ACTIVE') {
                return res.status(404).json({
                    success: false,
                    message: 'Destination account from favorite not found or inactive'
                });
            }
        }

        if (type === 'TRANSFER') {
            if (!source || !destination) {
                return res.status(400).json({
                    success: false,
                    message: 'Transfer requires source and destination accounts'
                });
            }

            if (amount > 2000) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot transfer more than Q2000 per transaction'
                });
            }

            if (source.balance < amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient funds'
                });
            }

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const todayTransfers = await Transaction.find({
                type: 'TRANSFER',
                sourceAccount: source._id,
                createdAt: { $gte: startOfDay }
            });

            const totalToday = todayTransfers.reduce((sum, t) => sum + t.amount, 0);

            if (totalToday + amount > 10000) {
                return res.status(400).json({
                    success: false,
                    message: 'Daily transfer limit of Q10000 exceeded'
                });
            }

            source.balance -= amount;
            destination.balance += amount;

            await source.save();
            await destination.save();
        }

        if (type === 'DEPOSIT') {
            if (!source || !destination) {
                return res.status(400).json({
                    success: false,
                    message: 'Deposit requires source and destination accounts'
                });
            }

            if (amount > 2000) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot deposit more than Q2000 per transaction'
                });
            }

            if (source.balance < amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient funds'
                });
            }

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const todayDeposits = await Transaction.find({
                type: 'DEPOSIT',
                sourceAccount: source._id,
                createdAt: { $gte: startOfDay }
            });

            const totalToday = todayDeposits.reduce((sum, t) => sum + t.amount, 0);

            if (totalToday + amount > 10000) {
                return res.status(400).json({
                    success: false,
                    message: 'Daily deposit limit of Q10000 exceeded'
                });
            }

            source.balance -= amount;
            destination.balance += amount;

            await source.save();
            await destination.save();
        }

        if (type === 'CREDIT') {
            if (req.user.role !== 'ADMIN_ROLE') {
                return res.status(403).json({
                    success: false,
                    message: 'Only admin can grant credits'
                });
            }

            if (!destination) {
                return res.status(400).json({
                    success: false,
                    message: 'Credit requires destination account'
                });
            }

            destination.balance += amount;
            await destination.save();
        }

        const transactionPayload = {
            type,
            amount,
            sourceAccount: source ? source._id : undefined,
            destinationAccount: destination ? destination._id : undefined,
            description,
            favorite: favoriteId && isObjectId(favoriteId) ? favoriteId : undefined,
            isReversible: type === 'TRANSFER',
            initiatedBy: req.user ? String(req.user.id) : undefined
        };

        const transaction = await Transaction.create(transactionPayload);

        return res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            transaction
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating transaction',
            error: error.message
        });
    }
};

export const updateTransaction = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN_ROLE') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can update transactions'
            });
        }

        const { id } = req.params;
        const { amount } = req.body;

        if (amount === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Only amount can be updated'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        const transaction = await Transaction.findById(id)
            .populate('sourceAccount')
            .populate('destinationAccount');

        if (!transaction || !transaction.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        if (transaction.status === 'reverted') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update a reverted transaction'
            });
        }

        if (!['DEPOSIT', 'TRANSFER'].includes(transaction.type)) {
            return res.status(400).json({
                success: false,
                message: 'Only DEPOSIT and TRANSFER can be updated'
            });
        }

        const difference = amount - transaction.amount;

        if (transaction.type === 'DEPOSIT') {

            if (transaction.sourceAccount.balance < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Operation would result in negative balance'
                });
            }

            transaction.sourceAccount.balance -= difference;
            transaction.destinationAccount.balance += difference;

            await transaction.sourceAccount.save();
            await transaction.destinationAccount.save();
        }

        if (transaction.type === 'TRANSFER') {

            if (!transaction.destinationAccount) {
                return res.status(400).json({
                    success: false,
                    message: 'Transfer must have destination account'
                });
            }

            transaction.sourceAccount.balance -= difference;
            transaction.destinationAccount.balance += difference;

            if (
                transaction.sourceAccount.balance < 0 ||
                transaction.destinationAccount.balance < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Operation would result in negative balance'
                });
            }

            await transaction.sourceAccount.save();
            await transaction.destinationAccount.save();
        }

        transaction.amount = amount;
        await transaction.save();

        return res.status(200).json({
            success: true,
            message: 'Transaction amount updated successfully',
            transaction
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating transaction',
            error: error.message
        });
    }
};


export const getAllTransactions = async (req, res) => {
    try {

        if (req.user.role !== 'ADMIN_ROLE') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can view all transactions'
            });
        }

        const transactions = await Transaction.find({ isActive: true })
            .populate('sourceAccount')
            .populate('destinationAccount')
            .sort({ createdAt: -1 });

        // Prepare caching headers: short TTL + conditional responses via ETag / Last-Modified
        const payload = JSON.stringify(transactions.map(t => ({
            id: t._id,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt || t.createdAt
        })));
        const etag = crypto.createHash('md5').update(payload).digest('hex');

        // Last-Modified: latest updatedAt or createdAt
        const lastModifiedDate = transactions.length > 0
            ? new Date(Math.max(...transactions.map(t => new Date(t.updatedAt || t.createdAt).getTime())))
            : new Date();

        res.set('ETag', etag);
        res.set('Last-Modified', lastModifiedDate.toUTCString());
        // short TTL: 5 seconds (adjustable)
        res.set('Cache-Control', 'public, max-age=5, must-revalidate');

        // Handle conditional requests
        const ifNoneMatch = req.headers['if-none-match'];
        const ifModifiedSince = req.headers['if-modified-since'];

        if ((ifNoneMatch && ifNoneMatch === etag) || (ifModifiedSince && new Date(ifModifiedSince) >= lastModifiedDate)) {
            return res.status(304).end();
        }

        return res.json({
            success: true,
            transactions
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching transactions',
            error: error.message
        });
    }
};

export const revertTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        if (transaction.reverted) {
            return res.status(400).json({
                success: false,
                message: 'Transaction already reverted'
            });
        }

        const now = new Date();
        const createdAt = new Date(transaction.createdAt);
        const diffInSeconds = (now - createdAt) / 1000;

        if (diffInSeconds > 60) {
            return res.status(400).json({
                success: false,
                message: 'Transaction can only be reverted within 1 minute'
            });
        }

        if (transaction.type === 'TRANSFER') {
            const source = await Account.findById(transaction.sourceAccount);
            const destination = await Account.findById(transaction.destinationAccount);

            if (!source || !destination) {
                return res.status(404).json({
                    success: false,
                    message: 'Accounts not found'
                });
            }

            if (destination.balance < transaction.amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Destination account does not have enough balance to revert'
                });
            }

            destination.balance -= transaction.amount;
            source.balance += transaction.amount;

            await source.save();
            await destination.save();
        }

        if (transaction.type === 'DEPOSIT') {
            const source = await Account.findById(transaction.sourceAccount);
            const destination = await Account.findById(transaction.destinationAccount);

            if (!source || !destination) {
                return res.status(404).json({
                    success: false,
                    message: 'Accounts not found'
                });
            }

            if (destination.balance < transaction.amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Destination account does not have enough balance to revert'
                });
            }

            destination.balance -= transaction.amount;
            source.balance += transaction.amount;

            await source.save();
            await destination.save();
        }

        transaction.reverted = true;
        await transaction.save();

        return res.status(200).json({
            success: true,
            message: 'Transaction reverted successfully'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error reverting transaction',
            error: error.message
        });
    }
};

export const changeTransactionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';

        const transaction = await Transaction.findByIdAndUpdate(
            id, 
            { isActive },
            { new: true}
        );

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: `Transacción no encontrada`,
            });
        }

        res.status(200).json({
            success: true,
            message: `Transacción ${action} exitosamente`,
            data: transaction
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado de la transacción',
            error: error.message,
        });
        
    }
}

export const getAccountsWithMostMovements = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN_ROLE') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can view accounts with most movements'
            });
        }

        const { sort } = req.query;
        const sortOrder = sort === 'asc' ? 1 : -1;

        const movementTypes = ['TRANSFER', 'PURCHASE', 'CREDIT'];

        const accountMovements = await Transaction.aggregate([
            {
                $match: {
                    type: { $in: movementTypes },
                    isActive: true
                }
            },
            {
                $facet: {
                    asSource: [
                        {
                            $group: {
                                _id: '$sourceAccount',
                                movementCount: { $sum: 1 }
                            }
                        }
                    ],
                    asDestination: [
                        {
                            $group: {
                                _id: '$destinationAccount',
                                movementCount: { $sum: 1 }
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    combined: {
                        $concatArrays: ['$asSource', '$asDestination']
                    }
                }
            },
            {
                $unwind: '$combined'
            },
            {
                $group: {
                    _id: '$combined._id',
                    totalMovements: { $sum: '$combined.movementCount' }
                }
            },
            {
                $sort: { totalMovements: sortOrder }
            }
        ]);

        const accountIds = accountMovements
            .filter(item => item._id !== null)
            .map(item => item._id);

        const accounts = await Account.find({ 
            _id: { $in: accountIds },
            isActive: true 
        });

        const accountMap = {};
        accounts.forEach(account => {
            accountMap[account._id.toString()] = account;
        });

        const result = accountMovements
            .filter(item => item._id !== null && accountMap[item._id.toString()])
            .map(item => ({
                account: accountMap[item._id.toString()],
                movementCount: item.totalMovements
            }));

        return res.json({
            success: true,
            message: `Accounts ordered by movements ${sort === 'asc' ? 'ascending' : 'descending'}`,
            sortOrder: sort === 'asc' ? 'ascending' : 'descending',
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching accounts with most movements',
            error: error.message
        });
    }
};

export const getMyTransactions = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 5;

        // find accounts that belong to the authenticated user
        const accounts = await Account.find({ externalUserId: String(req.user.id), isActive: true });
        const accountIds = accounts.map(a => a._id);

        if (accountIds.length === 0) {
            return res.json({ success: true, transactions: [] });
        }

        const transactions = await Transaction.find({
            isActive: true,
            $or: [
                { sourceAccount: { $in: accountIds } },
                { destinationAccount: { $in: accountIds } }
            ]
        })
        .populate('sourceAccount')
        .populate('destinationAccount')
        .sort({ createdAt: -1 })
        .limit(limit);

        // Caching: short TTL + ETag/Last-Modified for conditional GETs
        const payload = JSON.stringify(transactions.map(t => ({
            id: t._id,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt || t.createdAt
        })));
        const etag = crypto.createHash('md5').update(payload).digest('hex');
        const lastModifiedDate = transactions.length > 0
            ? new Date(Math.max(...transactions.map(t => new Date(t.updatedAt || t.createdAt).getTime())))
            : new Date();

        res.set('ETag', etag);
        res.set('Last-Modified', lastModifiedDate.toUTCString());
        res.set('Cache-Control', 'public, max-age=5, must-revalidate');

        const ifNoneMatch = req.headers['if-none-match'];
        const ifModifiedSince = req.headers['if-modified-since'];

        if ((ifNoneMatch && ifNoneMatch === etag) || (ifModifiedSince && new Date(ifModifiedSince) >= lastModifiedDate)) {
            return res.status(304).end();
        }

        return res.json({ success: true, transactions });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching user transactions', error: error.message });
    }
};

const maskAccountNumber = (accountNumber) => {
    const value = String(accountNumber || '');
    return value.length > 4 ? `••••${value.slice(-4)}` : value;
};

export const getTransactionReceipt = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('sourceAccount')
            .populate('destinationAccount');

        if (!transaction || !transaction.isActive) {
            return res.status(404).json({ success: false, message: 'Transacción no encontrada' });
        }

        if (req.user.role !== 'ADMIN_ROLE') {
            const accounts = await Account.find({ externalUserId: String(req.user.id) });
            const accountIds = accounts.map(a => String(a._id));
            const sourceId = transaction.sourceAccount ? String(transaction.sourceAccount._id) : null;
            const destinationId = transaction.destinationAccount ? String(transaction.destinationAccount._id) : null;
            const owns = (sourceId && accountIds.includes(sourceId)) || (destinationId && accountIds.includes(destinationId));

            if (!owns) {
                return res.status(403).json({ success: false, message: 'No autorizado para ver este comprobante' });
            }
        }

        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="comprobante-${transaction._id}.pdf"`);
        doc.pipe(res);

        // Cabecera "Bi Digital Blue"
        doc.rect(0, 0, doc.page.width, 90).fill('#002241');
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20).text('Banco Digital', 50, 30);
        doc.font('Helvetica').fontSize(12).text('Comprobante de transacción', 50, 58);

        doc.y = 120;
        doc.fillColor('#1a1c1c');

        const row = (label, value) => {
            doc.font('Helvetica-Bold').fontSize(11).text(label, 50, doc.y, { continued: true });
            doc.font('Helvetica').text(`  ${value ?? '-'}`);
            doc.moveDown(0.5);
        };

        row('Tipo:', transaction.type);
        row('Monto:', `Q ${Number(transaction.amount).toFixed(2)}`);
        row('Estado:', transaction.status);
        row('Fecha:', new Date(transaction.createdAt).toLocaleString('es-GT'));
        if (transaction.sourceAccount) {
            row('Cuenta origen:', maskAccountNumber(transaction.sourceAccount.accountNumber));
        }
        if (transaction.destinationAccount) {
            row('Cuenta destino:', maskAccountNumber(transaction.destinationAccount.accountNumber));
        }
        if (transaction.reference) {
            row('Referencia:', transaction.reference);
        }
        if (transaction.description) {
            row('Descripción:', transaction.description);
        }
        row('ID de transacción:', String(transaction._id));

        doc.end();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error generando el comprobante', error: error.message });
    }
};