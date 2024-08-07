import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";
import mongoose from "mongoose";



export const signUpValidation = {
    body: joi.object({
        name: joi.string().alphanum().min(3).max(30).required().messages({
            "any required" :"name is required",
            "string.min" :"name is too short"
        }),
        email:generalFields.email.required(),
        password: generalFields.password.required(),
        cPassword: joi.string().valid(joi.ref('password')),
        rPassword: joi.string().valid(joi.ref('cPassword')),
        age: joi.number().min(18).max(60).required(),
        gender: joi.string().valid("male" , "female").required(),
        role:joi.string().valid("user","admin").required(),
        id:generalFields.id.required()
    
    }).with("password" , "cPassword").with("cPassword" , "rPassword") ,  //Msh ba3ml cPassword required bs da m3nah eno lw ba3t password lazem ab3t cPassword
    
    //.options({presence:"required"})  kolo required

    // query:joi.object({
    //     flag: joi.string().required(),
    // })

    // file:joi.object({                        ///////////////////.Single(file)
    //     size: joi.number().positive().required(),
    //     path: joi.string().required(),
    //     filename: joi.string().required(),
    //     destination: joi.string().required(),
    //     mimetype: joi.string().required(),
    //     encoding: joi.string().required(),
    //     originalname: joi.string().required(),
    //     fieldname: joi.string().required(),
    // }).required()

        // files: joi.array().items(joi.object({                       ///////////////////.Array(files)

    //     size: joi.number().positive().required(),
    //     path: joi.string().required(),
    //     filename: joi.string().required(),
    //     destination: joi.string().required(),
    //     mimetype: joi.string().required(),
    //     encoding: joi.string().required(),
    //     originalname: joi.string().required(),
    //     fieldname: joi.string().required(),
    
    // }).required()). min(2).max(10).required()

    files:joi.object({                               //////////////////////////.fields(files)
    image: joi.array().items(generalFields.files).required(),
    images:joi.array().items(generalFields.files).required(),
    }).required(),

    // file: generalFields.file.required()   //validationSingle

    headers:generalFields.headers

}

export const signInValidation = joi.object({
    email: joi.string().email().required(),
    password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),

})
