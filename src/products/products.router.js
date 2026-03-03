import { Router } from "express";
import { createProduct, getProducts, updateProduct, deleteProduct, getProductById, purchaseProduct } from "./products.controller.js";
import { validateCreateProduct, validateProductID } from "../../middlewares/product-validator.js";
import { validateJWT } from "../../middlewares/validate-JWT.js";

const api = Router();

api.get('/', validateJWT, getProducts);
api.get('/:id', validateProductID, getProductById);

api.post('/create', validateCreateProduct, createProduct);
api.put('/update/:id', validateCreateProduct, validateProductID, updateProduct);
api.delete('/delete/:id', validateProductID, deleteProduct);
api.post('/purchase', validateJWT, purchaseProduct);

export default api;