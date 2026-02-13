'use strict';

import mongoose from "mongoose";

const accountSchema = mongoose.Schema(
    {
        externalUserId: {
            type: String,
            required: [true, 'External user id is required'],
            trim: true
        },
        accountNumber: {
            type: String,
            required: [true, 'Account number is required'],
            unique: true,
            trim: true,
            maxLength: [20, 'Account number cannot exceed 20 characters']
        },
        balance: {
            type: Number,
            required: [true, 'Balance is required'],
            min: [0, 'Balance cannot be negative'],
            default: 0
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: ['ACTIVE', 'BLOCKED', 'CLOSED'],
                message: 'Invalid account status'
            },
            default: 'ACTIVE'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

accountSchema.index({ externalUserId: 1 });
accountSchema.index({ accountNumber: 1 });

export default mongoose.model('Account', accountSchema);