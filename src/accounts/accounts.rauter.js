import { Router } from 'express';
import {
    createAccount,
    getAccounts,
    getAccountById,
    updateAccount,
    changeAccountStatus
} from './account.controller.js';

const router = Router();

router.post('/create', createAccount);

router.get('/get', getAccounts);

router.get('/:id', getAccountById);

router.put('/:id', updateAccount);

router.put('/:id/status', changeAccountStatus);

export default router;
