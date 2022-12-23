import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Magacin = new Schema({
    codeOfProd: {
        type: String
    },
    name: {
        type: String
    },
    company: {
        type: String
    },
    amount: {
        type: String
    },
    type: {
        type: String
    },
    arrived: {
        type: Boolean
    },
    owner: {
        type: String
    },
    garden: {
        type: String
    },
    buy: {
        type: Date,
        default : Date.now()
    }
});

export default mongoose.model('magacin', Magacin);