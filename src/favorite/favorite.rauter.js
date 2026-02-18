import { Router } from 'express';
import {
    createFavorite,
    getFavorites,
    getFavoriteById,
    updateFavorite,
    deleteFavorite
} from './favorite.controller.js';

const router = Router();

router.post('/create', createFavorite);

router.get('/get', getFavorites);

router.get('/:id', getFavoriteById);

router.put('/:id', updateFavorite);

router.delete('/:id', deleteFavorite);

export default router;
