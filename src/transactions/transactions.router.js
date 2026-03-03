import { Router } from "express";
import { 
    createTransaction,
    updateTransaction,
    getAllTransactions,
    revertTransaction
} from "./transaction.controller.js";

import { validateJWT } from "../../middlewares/validate-JWT.js";

const api = Router();

/**
 * @swagger
 * /transactions/create:
 *   post:
 *     summary: Crea una transacción (TRANSFER, DEPOSIT o CREDIT)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, amount]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [TRANSFER, DEPOSIT, CREDIT]
 *               amount:
 *                 type: number
 *                 example: 500
 *               sourceAccount:
 *                 type: string
 *               destinationAccount:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transacción creada
 *       400:
 *         description: Validación de negocio fallida
 *       403:
 *         description: Operación no autorizada
 */
api.post('/create', validateJWT, createTransaction);

/**
 * @swagger
 * /transactions/update/{id}:
 *   put:
 *     summary: Actualiza el monto de una transacción
 *     tags: [Transactions]
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
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 750
 *     responses:
 *       200:
 *         description: Transacción actualizada
 *       400:
 *         description: No se puede actualizar
 *       403:
 *         description: Solo administradores
 *       404:
 *         description: Transacción no encontrada
 */
api.put('/update/:id', validateJWT, updateTransaction);

/**
 * @swagger
 * /transactions/get:
 *   get:
 *     summary: Obtiene todas las transacciones activas
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transacciones obtenidas
 *       403:
 *         description: Solo administradores
 */
api.get('/get', validateJWT, getAllTransactions);

/**
 * @swagger
 * /transactions/revert/{id}:
 *   put:
 *     summary: Revierte una transacción dentro del tiempo permitido
 *     tags: [Transactions]
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
 *         description: Transacción revertida
 *       400:
 *         description: No se puede revertir
 *       404:
 *         description: Transacción no encontrada
 */
api.put('/revert/:id', validateJWT, revertTransaction);

export default api;