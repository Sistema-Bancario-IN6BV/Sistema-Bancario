'use strict';

import mongoose from "mongoose";

const transactionSchema = mongoose.Schema(
    {
        type: {
            type: String,
            required: [true, 'Transaction type is required'],
            enum: {
                values: ['TRANSFER', 'DEPOSIT', 'PURCHASE', 'CREDIT', 'REVERSAL','POINT_PURCHASE' ],
                message: 'Invalid transaction type'
            }
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0.01, 'Amount must be greater than 0']
        },
        sourceAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: false
        },
        destinationAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: false
        },
        description: {
            type: String,
            trim: true,
            maxLength: [300, 'Description cannot exceed 300 characters']
        },
        isReversible: {
            type: Boolean,
            default: false
        },
        isReversed: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
        }        
    },
    {
        timestamps: true,
        versionKey: false
    }
);

transactionSchema.index({ sourceAccount: 1 });
transactionSchema.index({ destinationAccount: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ createdAt: 1 });
transactionSchema.index({ isActive: 1, transactionType: 1});

export default mongoose.model('Transaction', transactionSchema);
