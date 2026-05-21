import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";


export const createCart ={
    body: joi.object({
        // productId:generalFields.id.required(),
        productId:joi.string().hex().length(24).required(),
        quantity:joi.number().integer().required(),
    }),
    headers:generalFields.headers.required()
}

export const removeCart ={
    body: joi.object({
        productId:joi.string().hex().length(24).required(),
    }),
    headers:generalFields.headers.required()
}

export const clearCart ={
    headers:generalFields.headers.required()
}



