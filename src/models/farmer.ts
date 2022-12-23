import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Farmer = new Schema({
    name: {
        type: String
    },
    lastname: {
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
    dateOfBirth: {
        type: Date
    },
    cityOfBirth: {
        type: String
    },
    phone: {
        type: String
    },
    approved: {
        type: Boolean
    }
});

export default mongoose.model('farmer', Farmer);