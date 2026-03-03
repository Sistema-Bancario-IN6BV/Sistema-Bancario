import { Router } from "express";
import { createProduct, getProducts, updateProduct, deleteProduct, getProductById, purchaseProduct, changeProductStatus } from "./products.controller.js";
import { validateCreateProduct, validateProductID } from "../../middlewares/product-validator.js";
import { validateProductStatusChange } from "../../middlewares/products-validators.js";
import { validateJWT } from "../../middlewares/validate-JWT.js";

const api = Router();

api.get('/', validateJWT, getProducts);
api.get('/:id', validateProductID, getProductById);

api.post('/create', validateCreateProduct, createProduct);
api.put('/update/:id', validateCreateProduct, validateProductID, updateProduct);
api.delete('/delete/:id', validateProductID, deleteProduct);
api.post('/purchase', validateJWT, purchaseProduct);
api.put('/activate/:id', validateProductStatusChange, changeProductStatus);
api.put('/deactivate/:id', validateProductStatusChange, changeProductStatus);

export default api;