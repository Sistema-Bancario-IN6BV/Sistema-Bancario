'use strict';

import mongoose from "mongoose";

const accountSchema = mongoose.Schema(
    {
        accountNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        externalUserId: {
            type: String,
            required: [true, 'External user id is required'],
            trim: true
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

export default mongoose.model('Account', accountSchema);