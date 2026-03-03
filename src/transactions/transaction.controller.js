'use strict';

import Transaction from './transaction.model.js';
import Account from '../accounts/accounts.model.js';
export const purchaseWithPoints = async (req, res) => {
    try {

        const { accountId, pointsToUse, description } = req.body;

        const account = await Account.findById(accountId);

        if (!account || !account.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        if (account.points < pointsToUse) {
            return res.status(400).json({
                success: false,
                message: 'Not enough points'
            });
        }

        account.points -= pointsToUse;
        await account.save();

        const transaction = await Transaction.create({
            type: 'PURCHASE',
            amount: 0,
            sourceAccount: accountId,
            description,
            status: 'COMPLETED'
        });

        return res.status(201).json({
            success: true,
            message: 'Product purchased with points',
            transaction
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error purchasing with points',
            error: error.message
        });
    }
};
export const updateTransactionStatus = async (req, res) => {
    try {

        if (req.user.role !== 'ADMIN_ROLE') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can change transaction status'
            });
        }

        const { id } = req.params;
        const { status } = req.body;

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        if (transaction.status === 'COMPLETED') {
            return res.status(400).json({
                success: false,
                message: 'Transaction already completed'
            });
        }

        transaction.status = status;
        await transaction.save();

        if (status === 'COMPLETED' && transaction.type === 'PURCHASE') {

            const account = await Account.findById(transaction.sourceAccount);

            if (account) {
                const points = Math.floor(transaction.amount / 100) * 5;
                account.points += points;
                await account.save();
            }
        }

        return res.json({
            success: true,
            message: 'Transaction status updated successfully',
            transaction
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating status',
            error: error.message
        });
    }
};

export const createTransaction = async (req, res) => {
    try {

        const { type, amount, sourceAccount, destinationAccount, description } = req.body;

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

        let source;
        let destination;

        if (sourceAccount) {
            source = await Account.findById(sourceAccount);

            if (!source || !source.isActive || source.status !== 'ACTIVE') {
                return res.status(404).json({
                    success: false,
                    message: 'Source account not found or inactive'
                });
            }
        }

        if (destinationAccount) {
            destination = await Account.findById(destinationAccount);

            if (!destination || !destination.isActive || destination.status !== 'ACTIVE') {
                return res.status(404).json({
                    success: false,
                    message: 'Destination account not found or inactive'
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
                    message: 'Cannot transfer more than 2000 per transaction'
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
                sourceAccount: sourceAccount,
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
            if (!destination) {
                return res.status(400).json({
                    success: false,
                    message: 'Deposit requires destination account'
                });
            }

            destination.balance += amount;
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

        const transaction = await Transaction.create({
            type,
            amount,
            sourceAccount,
            destinationAccount,
            description,
            isReversible: type === 'TRANSFER'
        });

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

            transaction.sourceAccount.balance += difference;

            if (transaction.sourceAccount.balance < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Operation would result in negative balance'
                });
            }

            await transaction.sourceAccount.save();
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
            .populate('destinationAccount');

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
            const destination = await Account.findById(transaction.destinationAccount);

            if (!destination) {
                return res.status(404).json({
                    success: false,
                    message: 'Account not found'
                });
            }

            if (destination.balance < transaction.amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Not enough balance to revert deposit'
                });
            }

            destination.balance -= transaction.amount;
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
