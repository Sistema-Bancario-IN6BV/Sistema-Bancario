import { convertBalance } from "./accounts.controller.js";
import { Router } from "express";
import { createAccount, updateAccount, deleteAccount, getMyAccounts, changeAccountStatus } from "./accounts.controller.js";
import { validateCreateAccount, validateGet, validateUpdateAccount } from "../../middlewares/account-validator.js";
import { validateAccountStatusChange } from "../../middlewares/account-validators.js";

const api = Router();
api.get('/convert-balance/:id', validateGet, convertBalance);
api.post('/create', validateCreateAccount, createAccount);
api.get('/me', validateGet, getMyAccounts);
api.put('/update/:id', validateUpdateAccount, updateAccount);
api.delete('/delete/:id', validateUpdateAccount, deleteAccount);
api.put('/:id/status/:status', validateAccountStatusChange, changeAccountStatus);

export default api;