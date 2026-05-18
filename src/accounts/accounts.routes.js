'use strict';

import { Router } from 'express';
import {
    createAccount,
    getAccounts,
    getAccountByNumber,
    deposit,
    withdraw,
    deleteAccount,
    transfer,
    requestAccount,
    getMyAccountRequests,
    getMyAccountSummary,
    getPendingAccountRequests,
    approveAccountRequest,
    rejectAccountRequest
} from './accounts.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole, USER_ROLES } from '../../middlewares/validate-role.js';

const router = Router();

router.post('/requests', validateJWT, requireRole(USER_ROLES.USER), requestAccount);
router.get('/requests/me', validateJWT, requireRole(USER_ROLES.USER), getMyAccountRequests);
router.get('/me/summary', validateJWT, requireRole(USER_ROLES.USER), getMyAccountSummary);
router.get('/requests', validateJWT, requireRole(USER_ROLES.ADMIN), getPendingAccountRequests);
router.post('/requests/:id/approve', validateJWT, requireRole(USER_ROLES.ADMIN), approveAccountRequest);
router.post('/requests/:id/reject', validateJWT, requireRole(USER_ROLES.ADMIN), rejectAccountRequest);

router.post('/create', createAccount);
router.get('/', getAccounts);
router.get('/:accountNumber', getAccountByNumber);
router.patch('/deposit/:accountNumber', deposit);
router.patch('/withdraw/:accountNumber', withdraw);
router.post('/transfer', transfer);
router.delete('/:accountNumber', deleteAccount);

export default router;