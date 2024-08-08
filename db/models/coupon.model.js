import { Schema, Types, model } from "mongoose";

const couponSchema = new Schema({
    code:{
        type:String,
        required: [true , "code is required"],
        minLength:3,
        maxLength:30,
        lowercase:true,
        trim:true,
        unique:true
    },
    amount:{
        type:Number,
        required:true,
        min:1,
        max:100
    },
    createdBy:{
        type:Types.ObjectId,
        ref:"user",
        required:true
    },
    usedBy:[{
        type:Types.ObjectId,
        ref:"user",
        required:true
    }],
    fromDate:{
        type:Date,
        required:[true , "fromData is required"]
    },
    toDate:{
        type:Date,
        required:[true , "toDate is required"]
    }
},{
    versionKey:false,
    timestamps:true,
})

const couponModel = model('coupon' , couponSchema)

export default couponModel