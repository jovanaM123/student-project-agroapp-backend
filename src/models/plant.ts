import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Plant = new Schema({
    username: {
        type: String
    },
    name: {
        type: String
    },
    sadnica: {
        type: String
    },
    garden: {
        type: String
    },
    w: {
        type: String
    },
    h: {
        type: String
    },
    napredak: {
        type: String
    },
    spremna: {
        type: Boolean
    }
});

export default mongoose.model('plant', Plant);