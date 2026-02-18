import { Router } from 'express';
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    changeProductStatus
} from './product.controller.js';

const router = Router();

router.post('/create', createProduct);

router.get('/get', getProducts);

router.get('/:id', getProductById);

router.put('/:id', updateProduct);

router.put('/:id/activate', changeProductStatus);
router.put('/:id/deactivate', changeProductStatus);

export default router;
