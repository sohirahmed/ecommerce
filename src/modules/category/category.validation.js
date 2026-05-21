import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";


export const createCategory ={
    body: joi.object({
        name : joi.string().min(3).max(30).required()
    }).required(),
    file:generalFields.file.required(),
    headers:generalFields.headers.required()
}

export const updateCategory ={
    body: joi.object({
        name : joi.string().min(3).max(30)
    }).required(),
    file:generalFields.file,
    headers:generalFields.headers.required()
}


