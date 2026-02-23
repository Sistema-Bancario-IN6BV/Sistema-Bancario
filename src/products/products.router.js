import { Router } from 'express';
import {createProduct, getProductById, getProducts, updateProduct } from './products.controller.js';
import {validateCreateProduct, validateUpdateProductRequest, validateProductStatusChange, validateGetProductById, validateUpdateProductRequest, validateCreateProduct } from '../../middlewares/products-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreateProduct,
    createProduct
)

router.get(
    '/get',
    getProducts
)

router.get('/:id', validateGetProductById, getProductById);

router.put(
    '/:id',
    validateUpdateProductRequest,
    updateProduct

);
router.put('/:id/activate', validateProductStatusChange, changeProductStatus);
router.put('/:id/desactivate', validateProductStatusChange, changeProductStatus);
export default router;