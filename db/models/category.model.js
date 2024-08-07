import { Schema, Types, model } from "mongoose";

const categorySchema = new Schema({
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
    toJSON:{virtuals : true},
    toObject:{virtuals : true}
})

categorySchema.virtual("subCategory" , {
    ref:"subCategory",
    localField:"_id",
    foreignField:"category"
})


const categoryModel = model('category' , categorySchema)

export default categoryModel