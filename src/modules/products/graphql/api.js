import { productType } from "./type.js";
import productModel from "../../../../db/models/product.model.js";
import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import postModel from "../../../../db/models/post.model.js";
import { createPostValidation } from "../product.validation.js";
import { AppError } from "../../../utils/classError.js";
import { graphqlValidation } from "../../../middleware/validation.js";
import { authGraphQl } from "../../../middleware/auth.js";

//query**===============================getProduct======================================
export const getProduct = {
    type:productType,
    args:{
        id:{type : GraphQLID}
    },
    resolve:async (_,args) => {
        const product = await productModel.findOne({_id: args.id}).populate("createdBy")
        return product

    }
}

//query**===============================getProducts======================================
export const getProducts = {
    type :new GraphQLList(productType),
    resolve: async () => {
        const products = await productModel.find()
        return products
    }
} 

//mutation**===============================createPost======================================
export const createPost = {
    type:productType,
    args:{
        title:{type:GraphQLString},
        description:{type:GraphQLString},
        category:{type:GraphQLID},
        token:{type:GraphQLString}

    },
    resolve:async(_,args)=>{
        const {title, description, createdBy} = args
        const error = await graphqlValidation(createPostValidation , {title, description, category})
        if(!error){
            throw new Error("validation error")
        }
        const user = await authGraphQl(args.token,["admin" , "user"])

        const post = await postModel.create({
            title,
            description,
            category
        })
        return post
    }
}

//mutation**===============================updatePost======================================
export const updatePost = {
    type:productType,
    args:{
        id:{type:new GraphQLNonNull(GraphQLID)},  //new graphQlNonNull() = required
        title:{type:GraphQLString},
        description:{type:GraphQLString},
        createdBy:{type:GraphQLID},

    },
    resolve:async(_,args)=>{
        const {id, title, description, createdBy} = args
        const post = await postModel.findOneAndUpdate({_id:id},{
            title,
            description,
            createdBy
        },{
            new:true
        })
        return post
    }
}

