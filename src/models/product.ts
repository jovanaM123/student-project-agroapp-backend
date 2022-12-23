import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Product = new Schema({
    codePr: {
        type: String
    },
    name: {
        type: String
    },
    owner: {
        type: String
    },
    type: {
        type: String
    },
    amount: {
        type: String
    },
    avRate: {
        type: String
    },
    price: {
        type: String
    },
    description: {
        type: String
    },
    neSmePored: {
        type: String
    }
});

export default mongoose.model('product', Product);