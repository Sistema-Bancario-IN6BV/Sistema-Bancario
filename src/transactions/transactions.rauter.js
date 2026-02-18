import { Router } from 'express';
import {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    reverseTransaction
} from './transaction.controller.js';

const router = Router();

router.post('/create', createTransaction);

router.get('/get', getTransactions);

router.get('/:id', getTransactionById);

router.put('/:id', updateTransaction);

router.put('/:id/reverse', reverseTransaction);

export default router;
