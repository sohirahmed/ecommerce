import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";


export const createSubCategory ={
    body: joi.object({
        name : joi.string().min(3).max(30).required(),

    }).required(),
    file:generalFields.file.required(),
    params: joi.object({
    categoryId: joi.string().hex().length(24).required()
    }),
    headers:generalFields.headers.required(),

}

export const updateSubCategory ={
    body: joi.object({
        name : joi.string().min(3).max(30)
    }).required(),
    file:generalFields.file,
    headers:generalFields.headers.required()
}

export const deleteSubCategory ={
    params: joi.object({
        subcategoryId: joi.string().hex().length(24).required()
    }),
    headers:generalFields.headers.required()
}