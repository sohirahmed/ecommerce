import { GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import subCategoryModel from "../../../../db/models/subCategory.model.js";





export let productType = new GraphQLObjectType({
    name:"product",
    fields:{
        title:{type:GraphQLString},
        description:{type:GraphQLString},
        category:{type:new GraphQLObjectType({
            name:"createdBy",
            fields:{_id:{type:GraphQLID} } 
        })
    },
    subCategories:{
        type:new GraphQLList(new GraphQLObjectType({
            name:"subCategories",
            fields:{
                _id:{type:GraphQLID}
            },
        })),
        resolve:async(parent , args)=>{
            const subCategories = await subCategoryModel.find({category:parent.category})
            return subCategories
        }
    }

    
    }
})