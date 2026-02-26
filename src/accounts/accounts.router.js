import { Router } from "express";
import { createAccount, updateAccount, deleteAccount, getMyAccounts } from "./accounts.controller.js";
import { validateCreateAccount, validateGet, validateUpdateAccount } from "../../middlewares/account-validator.js";

const api = Router();

api.post('/create', validateCreateAccount, createAccount);
api.get('/me', validateGet, getMyAccounts);
api.put('/update/:id', validateUpdateAccount, updateAccount);
api.delete('/delete/:id', validateUpdateAccount, deleteAccount);

export default api;