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
        points: {
            type: Number,
            default: 0,
            min: [0, 'Points cannot be negative']
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: ['ACTIVE', 'BLOCKED', 'CLOSED'],
                message: 'Invalid account status'
            },
            default: 'ACTIVE'
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

accountSchema.index({ externalUserId: 1 });
accountSchema.index({ isActive: 1, status: 1 });

export default mongoose.model('Account', accountSchema);