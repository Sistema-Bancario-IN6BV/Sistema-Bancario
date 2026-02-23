import { Router } from 'express';
import { createAccount } from './accounts.controller.js';

const router = Router();

router.post('/create', createAccount);

export default router;