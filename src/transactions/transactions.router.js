import { Router } from "express";
import { 
    createTransaction,
    updateTransaction,
    getAllTransactions,
    revertTransaction
} from "./transaction.controller.js";

import { validateJWT } from "../../middlewares/validate-JWT.js";

const api = Router();

api.post('/create', validateJWT, createTransaction);
api.put('/update/:id', validateJWT, updateTransaction);
api.get('/get', validateJWT, getAllTransactions);
api.put('/revert/:id', validateJWT, revertTransaction);

export default api;