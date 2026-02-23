import { Schema, model } from 'mongoose';

const accountSchema = Schema({
    accountNumber: {
        type: String,
        unique: true
    },
    balance: {
        type: Number,
        required: true,
        min: 100
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

export default model('Account', accountSchema);