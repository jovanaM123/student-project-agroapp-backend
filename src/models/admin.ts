import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Admin = new Schema({
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
    approved: {
        type: Boolean
    }
});

export default mongoose.model('admin', Admin);