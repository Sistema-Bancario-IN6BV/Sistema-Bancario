'use strict';

import Account from './accounts.model.js';
import { generateAccountNumber } from '../users/user.controller.js';

/* ===============================
   CREAR CUENTA
=================================*/
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
=================================*/
export const getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find();
        return res.json(accounts);
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

/* ===============================
   OBTENER CUENTA POR NUMERO
=================================*/
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
=================================*/
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
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

/* ===============================
   RETIRAR
=================================*/
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
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

/* ===============================
   ELIMINAR CUENTA
=================================*/
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
=================================*/
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
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};