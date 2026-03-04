import { convertBalance } from "./accounts.controller.js";
import { Router } from "express";
import { createAccount, updateAccount, deleteAccount, getMyAccounts, changeAccountStatus, getAccountWithMovements } from "./accounts.controller.js";
import { validateCreateAccount, validateGet, validateUpdateAccount } from "../../middlewares/account-validator.js";
import { validateAccountStatusChange } from "../../middlewares/account-validators.js";

const api = Router();

/**
 * @swagger
 * /accounts/convert-balance/{id}:
 *   get:
 *     summary: Convierte el saldo de una cuenta a una o varias monedas
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
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         description: Moneda(s) destino separadas por coma. Ej. USD o USD,EUR,JPY
 *     responses:
 *       200:
 *         description: Conversión realizada correctamente
 *       400:
 *         description: Parámetros inválidos
 *       403:
 *         description: Sin permisos sobre la cuenta
 *       404:
 *         description: Cuenta no encontrada
 */
api.get('/convert-balance/:id', validateGet, convertBalance);

/**
 * @swagger
 * /accounts/create:
 *   post:
 *     summary: Crea una nueva cuenta bancaria
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountNumber:
 *                 type: string
 *               balance:
 *                 type: number
 *                 example: 1000
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, BLOCKED, CLOSED]
 *     responses:
 *       201:
 *         description: Cuenta creada
 *       403:
 *         description: Solo administradores
 */
api.post('/create', validateCreateAccount, createAccount);

/**
 * @swagger
 * /accounts/me:
 *   get:
 *     summary: Obtiene las cuentas activas del usuario autenticado
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cuentas
 *       403:
 *         description: Solo administradores
 */
api.get('/me', validateGet, getMyAccounts);

/**
 * @swagger
 * /accounts/update/{id}:
 *   put:
 *     summary: Actualiza una cuenta existente
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               balance:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, BLOCKED, CLOSED]
 *     responses:
 *       200:
 *         description: Cuenta actualizada
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Cuenta no encontrada
 */
api.put('/update/:id', validateUpdateAccount, updateAccount);

/**
 * @swagger
 * /accounts/delete/{id}:
 *   delete:
 *     summary: Desactiva/cierra una cuenta
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cuenta desactivada
 *       403:
 *         description: Solo administradores o sin permisos
 *       404:
 *         description: Cuenta no encontrada
 */
api.delete('/delete/:id', validateUpdateAccount, deleteAccount);
api.put('/:id/status/:status', validateAccountStatusChange, changeAccountStatus);
api.get('/detail/:id', validateGet, getAccountWithMovements);

export default api;