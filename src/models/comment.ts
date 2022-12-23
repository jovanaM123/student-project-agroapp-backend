import moongoose from 'mongoose';

const Schema = moongoose.Schema;

let Comment = new Schema({
   codePr:{
        type: String
    },
    user:{
        type: String
    },
    rate:{
        type: String
    },
    comment:{
        type: String
    }
});

export default moongoose.model('comment', Comment);