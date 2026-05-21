import { Schema, Types, model } from "mongoose";

const reviewSchema = new Schema({
    comment:{
        type:String,
        required: [true , "comment is required"],
        minLength:3,
        trim:true,
    },
    rate:{
        type:Number,
        required:true,
        min:1,
        max:5
    },
    createdBy:{
        type:Types.ObjectId,
        ref:"user",
        required:true
    },
    productId:{
        type:Types.ObjectId,
        ref:"product",
        required:true
    },


},{
    versionKey:false,
    timestamps:true,
})

const reviewModel = model('review' , reviewSchema)

export default reviewModel