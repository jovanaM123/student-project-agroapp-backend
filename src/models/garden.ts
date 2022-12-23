import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Garden = new Schema({
    owner: {
        type: String
    },
    name: {
        type: String
    },
    place: {
        type: String
    },
    sadn: {
        type: String
    },
    totalSadn: {
        type: String
    },
    h20: {
        type: String
    },
    temp: {
        type: String
    },
    width: {
        type: String
    },
    heigth: {
        type: String
    }
});

export default mongoose.model('garden', Garden);