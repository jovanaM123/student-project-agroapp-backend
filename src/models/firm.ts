import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Firm = new Schema({
    name: {
        type: String
    },
    username: {
        type: String
    },
    password: {
        type: String
    },
    mail: {
        type: String
    },
    type: {
        type: String
    },
    date: {
        type: Date
    },
    city: {
        type: String
    },
    approved: {
        type: Boolean
    }
});

export default mongoose.model('firm', Firm);