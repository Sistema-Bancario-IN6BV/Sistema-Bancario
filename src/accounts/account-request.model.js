'use strict';

import mongoose from 'mongoose';

const accountRequestSchema = new mongoose.Schema(
    {
        externalUserId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING',
        },
        reviewNote: {
            type: String,
            default: '',
            trim: true,
        },
        reviewedBy: {
            type: String,
            default: '',
            trim: true,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
        accountId: {
            type: String,
            default: '',
            trim: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

accountRequestSchema.index({ externalUserId: 1, status: 1 });

export default mongoose.model('AccountRequest', accountRequestSchema);