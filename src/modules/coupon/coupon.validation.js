import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";


export const createCoupon ={
    body: joi.object({
        code:joi.string().min(3).max(30).required(),
        amount:joi.number().min(1).max(100).integer().required(),
        fromDate:joi.date().greater(Date.now()).required(),
        toDate:joi.date().greater(joi.ref("fromDate")).required()  
    }),
    headers:generalFields.headers.required()
}

export const updateCoupon ={
    body: joi.object({
        code:joi.string().min(3).max(30),
        amount:joi.number().min(1).max(100).integer(),
        fromDate:joi.date().greater(Date.now()),
        toDate:joi.date().greater(joi.ref("fromDate"))  
    }),
    headers:generalFields.headers.required()
}

