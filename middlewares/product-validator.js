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
        .withMessage('El nombre del servicio es obligatorio')
        .isLength({ min: 2, max: 150 })
        .withMessage('El nombre del servicio debe tener entre 2 y 150 caracteres'),
    body('price')
        .notEmpty()
        .withMessage('El precio es obligatorio')
        .custom((value) => {
            if (value === '' || value === null || value === undefined) return false;
            const parsed = Number(value);
            if (!Number.isFinite(parsed)) return false;
            if (parsed <= 0) return false;
            return true;
        })
        .withMessage('El precio debe ser un número mayor a cero'),
    body('description')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede superar 500 caracteres'),
    checkValidators
];

export const validateUpdateProduct = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    param('id').isMongoId().withMessage('ID de producto no válido'),
    body('name')
        .optional({ nullable: true })
        .trim()
        .notEmpty()
        .withMessage('El nombre del servicio es obligatorio')
        .isLength({ min: 2, max: 150 })
        .withMessage('El nombre del servicio debe tener entre 2 y 150 caracteres'),
    body('price')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) return true;
            const parsed = Number(value);
            if (!Number.isFinite(parsed)) return false;
            if (parsed <= 0) return false;
            return true;
        })
        .withMessage('El precio debe ser un número mayor a cero'),
    body('description')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede superar 500 caracteres'),
    checkValidators
];

export const validateProductID = [
    param('id').isMongoId().withMessage('ID de producto no válido'),
    checkValidators
];