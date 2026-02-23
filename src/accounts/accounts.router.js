import { Router } from 'express';
import {createAccount, getAccountById, getAccounts, updateAccount } from './accounts.controller.js';
import {validateCreateAccount, validateUpdateAccountRequest, validateAccountStatusChange, validateGetAccountById, validateUpdateAccountRequest } from '../../middlewares/account-validators.js';

const router = Router();

router.post(
    '/create',  
    validateCreateAccount,
    createAccount
)

router.get(
    '/get',
    getAccounts
)

router.get('/:id', validateGetAccountById, getAccountById);

router.put(
    '/:id',
    validateUpdateAccountRequest,
    updateAccount

);
router.put('/:id/activate', validateAccountStatusChange, changeAccountStatus);
router.put('/:id/desactivate', validateAccountStatusChange, changeAccountStatus);

export default router;