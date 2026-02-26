'use strict'
import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';

export const validateCreateAccount = [
    validateJWT,
    body('accountNumber')
        .trim()
        .notEmpty()
        .withMessage('El número de cuenta es requerido')
        .isLength({ max: 20 })
        .withMessage('El número de cuenta no puede exceder 20 caracteres'),
    body('balance')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El balance inicial no puede ser negativo'),
    checkValidators
];

export const validateUpdateAccount = [
    validateJWT,
    param('id').isMongoId().withMessage('ID de cuenta no válido'),
    body('status')
        .optional()
        .isIn(['ACTIVE', 'BLOCKED', 'CLOSED'])
        .withMessage('Estado no válido'),
    checkValidators
];

export const validateGet = [
    validateJWT
]