import { Router } from "express";
import { 
    createTransaction,
    updateTransaction,
    getAllTransactions,
    revertTransaction,
    getAccountsWithMostMovements
} from "./transaction.controller.js";

import { validateJWT } from "../../middlewares/validate-JWT.js";

const api = Router();

api.post('/create', validateJWT, createTransaction);
api.put('/update/:id', validateJWT, updateTransaction);
api.get('/get', validateJWT, getAllTransactions);
api.put('/revert/:id', validateJWT, revertTransaction);

/**
 * @swagger
 * /transactions/accounts-with-most-movements:
 *   get:
 *     summary: Obtiene las cuentas con más movimientos (TRANSFER, PURCHASE, CREDIT)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Ordenar por cantidad de movimientos (asc = ascendente, desc = descendente)
 *     responses:
 *       200:
 *         description: Cuentas ordenadas por movimientos
 *       403:
 *         description: Solo administradores
 */
api.get('/accounts-with-most-movements', validateJWT, getAccountsWithMostMovements);

export default api;
