'use strict';

import mongoose from "mongoose";

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxLength: [150, 'Name cannot exceed 150 characters']
        },
        description: {
            type: String,
            trim: true,
            maxLength: [500, 'Description cannot exceed 500 characters']
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        },
        isActive: {
            type: Boolean,
            default: true
        },

    },
    {
        timestamps: true,
        versionKey: false
    }
);

productSchema.index({ isActive: 1 });

export default mongoose.model('Product', productSchema);
