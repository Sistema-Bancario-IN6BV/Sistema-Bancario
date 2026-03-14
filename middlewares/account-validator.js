'use strict'
import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js'; // Importa tu validador de roles

export const validateCreateAccount = [
    validateJWT,
    requireRole('ADMIN_ROLE'), // Bloqueo a nivel de middleware antes de llegar al controller
    body('externalUserId')
        .notEmpty()
        .withMessage('El ID del usuario es obligatorio para asignar la cuenta'),
    body('accountNumber')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('El número de cuenta no puede exceder 20 caracteres'),
    body('balance')
        .notEmpty()
        .withMessage('El balance inicial es obligatorio')
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