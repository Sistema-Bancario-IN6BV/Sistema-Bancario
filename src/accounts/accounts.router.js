import { convertBalance } from "./accounts.controller.js";
import { Router } from "express";
import { createAccount, updateAccount, deleteAccount, getMyAccounts, getAccountWithMovements } from "./accounts.controller.js";
import { validateCreateAccount, validateGet, validateUpdateAccount } from "../../middlewares/account-validator.js";

const api = Router();
api.get('/convert-balance/:id', validateGet, convertBalance);
api.post('/create', validateCreateAccount, createAccount);
api.get('/me', validateGet, getMyAccounts);
api.put('/update/:id', validateUpdateAccount, updateAccount);
api.delete('/delete/:id', validateUpdateAccount, deleteAccount);

/**
 * @swagger
 * /accounts/detail/{id}:
 *   get:
 *     summary: Obtiene los detalles de una cuenta específica con saldo y últimos 5 movimientos
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la cuenta
 *     responses:
 *       200:
 *         description: Detalles de la cuenta con movimientos
 *       403:
 *         description: Solo administradores
 *       404:
 *         description: Cuenta no encontrada
 */
api.get('/detail/:id', validateGet, getAccountWithMovements);

export default api;
