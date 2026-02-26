'use strict'
import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';

export const validateAddFavorite = [
    validateJWT,
    body('accountId')
        .notEmpty()
        .isMongoId()
        .withMessage('ID de cuenta a agregar no válido'),
    body('alias')
        .trim()
        .notEmpty()
        .withMessage('El alias es requerido')
        .isLength({ max: 100 }),
    checkValidators
];

export const validateIdFavorite = [
    validateJWT,
    param('id').isMongoId().withMessage('ID de favorito no válido'),
    checkValidators
];