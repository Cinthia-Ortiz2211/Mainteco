import { Schema, model } from 'mongoose';

const paymentSchema = new Schema({
    method: {
        type: String,
        enum: ['bank_transfer', 'cash', 'qr_code'],
        required: true
    },
    details: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Payment = model('Payment', paymentSchema);

export default Payment;