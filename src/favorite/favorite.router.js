import { Router } from 'express';
import {createFavorite, getFavoriteById, getFavorites, updateFavorite } from './favorite.controller.js';
import {validateCreateFavorite, validateUpdateFavoriteRequest, validateFavoriteStatusChange, validateGetFavoriteById, validateUpdateAccountRequest } from '../../middlewares/favorite-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreateFavorite,
    createFavorite
)

router.get(
    '/get',
    getFavorites
)

router.get('/:id', validateGetFavoriteById, getFavoriteById);

router.put(
    '/:id',
    validateUpdateFavoriteRequest,
    updateFavorite

);
router.put('/:id/activate', validateFavoriteStatusChange, changeFavoriteStatus);
router.put('/:id/desactivate', validateFavoriteStatusChange, changeFavoriteStatus);
export default router;