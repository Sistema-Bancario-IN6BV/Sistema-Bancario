'use strict';

import mongoose from "mongoose";

const favoriteSchema = mongoose.Schema(
    {
        externalUserId: {
            type: String,
            required: [true, 'External user id is required'],
            trim: true
        },
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: [true, 'Account is required']
        },
        alias: {
            type: String,
            required: [true, 'Alias is required'],
            trim: true,
            maxLength: [100, 'Alias cannot exceed 100 characters']
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

favoriteSchema.index({ externalUserId: 1 });
favoriteSchema.index({ accountId: 1 });

export default mongoose.model('Favorite', favoriteSchema);
