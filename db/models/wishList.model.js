import { Schema, Types, model } from "mongoose";

const wishListSchema = new Schema({

    user:{
        type:Types.ObjectId,
        ref:"user",
        required:true
    },
    products:[{
        type:Types.ObjectId,
        ref:"product",
        required:true
    }],


},{
    versionKey:false,
    timestamps:true,
})

const wishListModel = model('wishList' , wishListSchema)

export default wishListModel