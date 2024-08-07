import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";


export const createProduct ={
    body: joi.object({
        title : joi.string().min(3).max(30).required(),
        stock:joi.number().min(1).integer().required(),
        discount:joi.number().min(0).max(100),
        price:joi.number().min(1).integer().required(),
        brand:joi.string().hex().length(24).required(),
        subCategory:joi.string().hex().length(24).required(),
        category:joi.string().hex().length(24).required(),
        description:joi.string(),
    }),
    files:joi.object({
        image:joi.array().items(generalFields.file.required()).required(),
        coverImages:joi.array().items(generalFields.file.required())
    }).required(),
    headers:generalFields.headers.required(),
}

export const updateProduct ={
    body: joi.object({
        title : joi.string().min(3).max(30),
        stock:joi.number().min(1).integer(),
        discount:joi.number().min(0).max(100),
        price:joi.number().min(1).integer(),
        brand:joi.string().hex().length(24).required(),
        subCategory:joi.string().hex().length(24).required(),
        category:joi.string().hex().length(24).required(),
        description:joi.string(),
    }),
    
    params: joi.object({
        id:joi.string().hex().length(24).required(),
    }),

    files:joi.object({
        image:joi.array().items(generalFields.file),
        coverImages:joi.array().items(generalFields.file)
    }),
    headers:generalFields.headers.required(),
}
