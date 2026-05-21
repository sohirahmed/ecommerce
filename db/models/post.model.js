import { Schema, Types, model } from "mongoose";

const postSchema = new Schema({
    title:{
        type:String,
        required: [true , "title is required"],
        minLength:3,
        maxLength:25,
        lowercase:true,
        trim:true,
        unique:true
    },
    description:{
        type:String,
        minLength:3,
        trim:true
    },
    createdBy:{
        type:Types.ObjectId,
        ref:"user",
        required:true
    }

},{
    versionKey:false,
    timestamps:true,
})

const postModel = model('post' , postSchema)

export default postModel