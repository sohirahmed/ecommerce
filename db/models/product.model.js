import { Schema, Types, model } from "mongoose";

const productSchema = new Schema({
    title:{
        type:String,
        required: [true , "title is required"],
        minLength:3,
        maxLength:25,
        lowercase:true,
        trim:true,
        unique:true
    },
    slug:{
        type:String,
        minLength:3,
        maxLength:60,
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
    },
    category:{
        type:Types.ObjectId,
        ref:"category",
        required:true
    },
    subCategory:{
        type:Types.ObjectId,
        ref:"subCategory",
        required:true
    },
    brand:{
        type:Types.ObjectId,
        ref:"brand",
        required:true
    },

    image:{
        secure_url:String,
        public_id:String
    },
    coverImages:[{
        secure_url:String,
        public_id:String
    }],
    customId:String,
    price:{
        type:Number,
        required: true,
        min:1
    },
    discount:{
        type:Number,
        default:1,
        min:1,
        max:100
    },
    subPrice:{
        type:Number,
        default:1
    },
    stock:{
        type:Number,
        default:1,
        required:true
    },
    ratingAvg:{
        type:Number,
        default:0
    },
    rateNum:{
        type:Number,
        default:0
    }

},{
    versionKey:false,
    timestamps:true,
})

const productModel = model('product' , productSchema)

export default productModel