import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

export const validateCreateTransaction = [
    validateJWT,

    body('type')
        .notEmpty()
        .withMessage('Transaction type is required')
        .isIn(['TRANSFER', 'DEPOSIT', 'PURCHASE', 'CREDIT'])
        .withMessage('Invalid transaction type'),

    body('accountNumber')
        .notEmpty()
        .withMessage('Account number is required')
        .isString()
        .withMessage('Account number must be a string')
        .isLength({ min: 5, max: 20 })
        .withMessage('Account number must be between 5 and 20 characters'),

    body('destinationAccountNumber')
        .optional()
        .isString()
        .withMessage('Destination account number must be a string')
        .isLength({ min: 5, max: 20 })
        .withMessage('Destination account number must be between 5 and 20 characters'),

    body('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0')
        .custom((value, { req }) => {
            if (req.body.type === 'TRANSFER' && value > 2000) {
                throw new Error('You cannot transfer more than Q2000 per transaction');
            }
            return true;
        }),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Description cannot exceed 255 characters'),

    checkValidators,
];

export const validateCreateDeposit = [
    validateJWT,
    requireRole('ADMIN_ROLE'),

    body('type')
        .equals('DEPOSIT')
        .withMessage('Transaction type must be DEPOSIT'),

    body('accountNumber')
        .notEmpty()
        .withMessage('Account number is required'),

    body('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0'),

    checkValidators,
];

export const validateReverseTransaction = [
    validateJWT,
    requireRole('ADMIN_ROLE'),

    param('id')
        .isMongoId()
        .withMessage('Transaction ID must be a valid MongoDB ObjectId'),

    checkValidators,
];

export const validateGetTransactionById = [
    validateJWT,

    param('id')
        .isMongoId()
        .withMessage('Transaction ID must be a valid MongoDB ObjectId'),

    checkValidators,
];

export const validateGetTransactionsByAccount = [
    validateJWT,

    param('accountNumber')
        .notEmpty()
        .withMessage('Account number is required')
        .isString()
        .withMessage('Account number must be a string'),

    checkValidators,
];
