import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";


export const createReview ={
    body: joi.object({
        comment:joi.string().required(),
        rate:joi.number().min(1).max(5).integer().required(),
    }),
    params:joi.object({
        productId:joi.string().hex().length(24).required(),
    }).required(),
    headers:generalFields.headers.required()
}
export const deleteReview ={
    params:joi.object({
        id:joi.string().hex().length(24),
    }).required(),
    headers:generalFields.headers.required()
}


