import moongoose from 'mongoose';

const Schema = moongoose.Schema;

let Rate = new Schema({
   codePr:{
        type: String
    },
    user:{
        type: String
    },
    rate:{
        type: String
    }
});

export default moongoose.model('rate', Rate);