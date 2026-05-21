import express from 'express'
import * as WC from './wishList.controller.js'
import { auth } from '../../middleware/auth.js'
import { validation } from '../../middleware/validation.js'
import * as WV from './wishList.validation.js'
import { systemRoles } from '../../utils/systemRoles.js'
const wishListRouter = express.Router({mergeParams:true})


wishListRouter.post('/' ,
    validation(WV.createWishList),
    auth(Object.values(systemRoles)),
    WC.createWishList);


export default wishListRouter