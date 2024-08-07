import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";


export const createWishList ={
    params:joi.object({
        productId:joi.string().hex().length(24).required(),
    }).required(),
    headers:generalFields.headers.required()
}


