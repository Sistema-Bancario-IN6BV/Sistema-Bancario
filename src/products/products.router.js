import { Router } from "express";
import { createProduct, getProducts, updateProduct, deleteProduct, getProductById } from "./products.controller.js";
import { validateCreateProduct, validateProductID } from "../../middlewares/product-validator.js";
import { validateJWT } from "../../middlewares/validate-JWT.js";

const api = Router();

// Rutas públicas (solo requieren estar logeado)
api.get('/', validateJWT, getProducts);
api.get('/:id', validateProductID, getProductById);

// Rutas de administración
api.post('/create', validateCreateProduct, createProduct);
api.put('/update/:id', validateCreateProduct, validateProductID, updateProduct);
api.delete('/delete/:id', validateProductID, deleteProduct);

export default api;