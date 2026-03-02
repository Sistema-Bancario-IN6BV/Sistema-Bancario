import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';

export const validateAddFavorite = [
    validateJWT,

    body('accountNumber')
        .notEmpty()
        .withMessage('Account number is required')
        .isString()
        .withMessage('Account number must be a string'),

    body('destinationAccountNumber')
        .notEmpty()
        .withMessage('Destination account number is required')
        .isString()
        .withMessage('Destination account number must be a string'),

    body('alias')
        .notEmpty()
        .withMessage('Alias is required')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Alias must be between 2 and 50 characters'),

    checkValidators,
];

export const validateUpdateFavorite = [
    validateJWT,

    param('id')
        .isMongoId()
        .withMessage('Favorite ID must be a valid MongoDB ObjectId'),

    body('alias')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Alias must be between 2 and 50 characters'),

    checkValidators,
];

export const validateDeleteFavorite = [
    validateJWT,

    param('id')
        .isMongoId()
        .withMessage('Favorite ID must be a valid MongoDB ObjectId'),

    checkValidators,
];

export const validateGetFavoritesByAccount = [
    validateJWT,

    param('accountNumber')
        .notEmpty()
        .withMessage('Account number is required'),

    checkValidators,
];
