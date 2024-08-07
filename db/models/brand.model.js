import { Schema, Types, model } from "mongoose";

const brandSchema = new Schema({
    name:{
        type:String,
        required: [true , "name is required"],
        minLength:3,
        maxLength:25,
        lowercase:true,
        trim:true,
        unique:true
    },
    slug:{
        type:String,
        minLength:3,
        maxLength:25,
        trim:true,
        unique:true
    },
    createdBy:{
        type:Types.ObjectId,
        ref:"user",
        required:true
    },
    image:{
        secure_url:String,
        public_id:String
    },
    customId:String

},{
    versionKey:false,
    timestamps:true,
})

const brandModel = model('brand' , brandSchema)

export default brandModel