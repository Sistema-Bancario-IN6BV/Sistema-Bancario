import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

export const validateCreateAccount = [
    validateJWT,
    requireRole('ADMIN_ROLE'),

    body('externalUserId')
        .notEmpty()
        .withMessage('External user id is required')
        .isString()
        .withMessage('External user id must be a string'),

    checkValidators,
];



export const validateGetAccountById = [
    validateJWT,

    param('id')
        .isMongoId()
        .withMessage('ID must be a valid MongoDB ObjectId'),

    checkValidators,
];



export const validateAccountStatusChange = [
    validateJWT,
    requireRole('ADMIN_ROLE'),

    param('id')
        .isMongoId()
        .withMessage('ID must be a valid MongoDB ObjectId'),

    checkValidators,
];
