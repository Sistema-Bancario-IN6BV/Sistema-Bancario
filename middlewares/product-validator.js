'use strict'
import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

export const validateCreateProduct = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    body('name')
        .trim()
        .notEmpty()
        .isLength({ max: 150 }),
    body('price')
        .notEmpty()
        .isFloat({ min: 0 })
        .withMessage('Precio debe ser un número positivo'),
    body('description')
        .optional()
        .isLength({ max: 500 }),
    checkValidators
];

export const validateProductID = [
    param('id').isMongoId().withMessage('ID de producto no válido'),
    checkValidators
];