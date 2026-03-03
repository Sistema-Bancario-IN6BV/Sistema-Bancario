import { Router } from "express";
import { createTransaction, updateTransaction, getAllTransactions, revertTransaction, changeTransactionStatus } from "./transaction.controller.js";
import { validateTransactionStatusChange } from "../../middlewares/transaction-validators.js";
import { validateJWT } from "../../middlewares/validate-JWT.js";

const api = Router();

api.post('/create', validateJWT, createTransaction);
api.put('/update/:id', validateJWT, updateTransaction);
api.get('/get', validateJWT, getAllTransactions);
api.put('/revert/:id', validateJWT, revertTransaction);
api.put('/activate/:id', validateTransactionStatusChange, changeTransactionStatus);
api.put('/deactivate/:id', validateTransactionStatusChange, changeTransactionStatus);

export default api;