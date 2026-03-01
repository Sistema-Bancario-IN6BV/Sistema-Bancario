import { Router } from 'express';
import {createTransaction, createTransaction, getTransactionById, getTransactions, getTransactions, updateTransaction, reverseTransaction } from './transaction.controller.js';
import {validateCreateTransaction, validateUpdateTransactionRequest, validateTransactionStatusChange, validateGetTransactionById, validateUpdateTransactionRequest, validateCreateTransaction, validateReverseTransaction } from '../../middlewares/transaction-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreateTransaction,
    createTransaction
)

router.get(
    '/get',
    getTransactions
)

router.get('/:id', validateGetTransactionById, getTransactionById);

router.put(
    '/:id',
    validateUpdateTransactionRequest,
    updateTransaction   

);
router.put('/:id/activate', validateTransactionStatusChange, changeTransactionStatus);
router.put('/:id/desactivate', validateTransactionStatusChange, changeTransactionStatus);

// Ruta para revertir un depósito
router.post('/:id/reverse', validateReverseTransaction, reverseTransaction);

export default router;
