import { Router } from "express";
import { 
    createTransaction,
    updateTransaction,
    getAllTransactions,
    revertTransaction,
    updateTransactionStatus,
    purchaseWithPoints
} from "./transaction.controller.js";

import { validateJWT } from "../../middlewares/validate-JWT.js";

const api = Router();
api.post('/purchase-points', validateJWT, purchaseWithPoints);
api.put('/update-status/:id', validateJWT, updateTransactionStatus);
api.post('/create', validateJWT, createTransaction);
api.put('/update/:id', validateJWT, updateTransaction);
api.get('/get', validateJWT, getAllTransactions);
api.put('/revert/:id', validateJWT, revertTransaction);

export default api;