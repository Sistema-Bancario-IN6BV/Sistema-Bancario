'use strict';

import { Router } from 'express';
import {
    createAccount,
    getAccounts,
    getAccountByNumber,
    deposit,
    withdraw,
    deleteAccount,
    transfer
} from './accounts.controller.js';

const router = Router();

router.post('/create', createAccount);
router.get('/', getAccounts);
router.get('/:accountNumber', getAccountByNumber);
router.patch('/deposit/:accountNumber', deposit);
router.patch('/withdraw/:accountNumber', withdraw);
router.post('/transfer', transfer);
router.delete('/:accountNumber', deleteAccount);

export default router;