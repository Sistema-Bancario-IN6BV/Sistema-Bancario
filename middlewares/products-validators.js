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
        .withMessage('Product name is required')
        .isLength({ min: 2, max: 150 })
        .withMessage('Name must be between 2 and 150 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),

    body('price')
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ min: 0 })
        .withMessage('Price cannot be negative'),

    checkValidators,
];

export const validateUpdateProduct = [
    validateJWT,
    requireRole('ADMIN_ROLE'),

    param('id')
        .isMongoId()
        .withMessage('Product ID must be a valid MongoDB ObjectId'),

    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 150 })
        .withMessage('Name must be between 2 and 150 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),

    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price cannot be negative'),

    checkValidators,
];

export const validateProductStatusChange = [
    validateJWT,
    requireRole('ADMIN_ROLE'),

    param('id')
        .isMongoId()
        .withMessage('Product ID must be a valid MongoDB ObjectId'),

    checkValidators,
];

export const validateGetProductById = [
    validateJWT,

    param('id')
        .isMongoId()
        .withMessage('Product ID must be a valid MongoDB ObjectId'),

    checkValidators,
];
