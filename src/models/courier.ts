import moongoose from 'mongoose';

const Schema = moongoose.Schema;

let Courier = new Schema({
    name:{
        type: String
    },
    available:{
        type: Boolean
    },
    notAv: {
        type: Date
    }
});

export default moongoose.model('courier', Courier);