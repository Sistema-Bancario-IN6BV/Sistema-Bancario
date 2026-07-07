'use strict';

import mongoose from 'mongoose';
import Account from '../accounts/accounts.model.js';

export class InsufficientFundsError extends Error {
    constructor(message = 'Insufficient funds') {
        super(message);
        this.name = 'InsufficientFundsError';
    }
}

// Money-movement writes must be all-or-nothing. This requires MongoDB to run
// as a replica set (Atlas provisions this by default, even on the free tier;
// a local single-node mongod needs `rs.initiate()` once).
export const runInLedgerTransaction = async (work) => {
    const session = await mongoose.startSession();
    try {
        let result;
        await session.withTransaction(async () => {
            result = await work(session);
        });
        return result;
    } catch (error) {
        if (error.code === 20 || /Transaction numbers are only allowed/.test(error.message || '')) {
            throw new Error(
                'MongoDB debe estar configurado como replica set para soportar transacciones ' +
                '(requerido para operaciones de dinero). En Atlas esto ya viene por defecto; ' +
                'en local, inicializa un replica set de un solo nodo (mongod --replSet rs0 y luego rs.initiate()).'
            );
        }
        throw error;
    } finally {
        await session.endSession();
    }
};

// Atomic conditional decrement: the balance>=amount guard and the decrement
// happen as a single write, closing the read-then-save lost-update race.
export const debitAccount = async (accountId, amount, session) => {
    const account = await Account.findOneAndUpdate(
        { _id: accountId, balance: { $gte: amount } },
        { $inc: { balance: -amount } },
        { returnDocument: 'after', session }
    );

    if (!account) {
        throw new InsufficientFundsError();
    }

    return account;
};

export const creditAccount = async (accountId, amount, session) => {
    const account = await Account.findByIdAndUpdate(
        accountId,
        { $inc: { balance: amount } },
        { returnDocument: 'after', session }
    );

    if (!account) {
        throw new Error('Destination account not found');
    }

    return account;
};

export const debitPoints = async (accountId, points, session) => {
    const account = await Account.findOneAndUpdate(
        { _id: accountId, points: { $gte: points } },
        { $inc: { points: -points } },
        { returnDocument: 'after', session }
    );

    if (!account) {
        throw new InsufficientFundsError('Not enough points');
    }

    return account;
};

export const creditPoints = async (accountId, points, session) => {
    return Account.findByIdAndUpdate(
        accountId,
        { $inc: { points } },
        { returnDocument: 'after', session }
    );
};
