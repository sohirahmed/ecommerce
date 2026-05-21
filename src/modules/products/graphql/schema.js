import { createPost, getProducts, updatePost } from "../graphql/api.js";
import { getProduct } from "./api.js";
import { GraphQLObjectType, GraphQLSchema } from "graphql";



export const productSchema = new GraphQLSchema({
    query:new GraphQLObjectType({
        name:"query",
        fields:{
            getProduct,
            getProducts

        }
    }),
    mutation: new GraphQLObjectType({
        name:"mutation",
        fields:{
            createPost,
            updatePost
        }
    })
})