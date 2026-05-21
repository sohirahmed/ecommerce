import express from 'express'
import * as CaC from './cart.controller.js'
import { auth } from '../../middleware/auth.js'
import { validation } from '../../middleware/validation.js'
import * as CaV from './cart.validation.js'
import { systemRoles } from '../../utils/systemRoles.js'
const cartRouter = express.Router()


cartRouter.post('/' ,
    validation(CaV.createCart),
    auth([systemRoles.admin]),
    CaC.createCart);

cartRouter.patch('/' ,
    validation(CaV.removeCart),
    auth(Object.values(systemRoles)),
    CaC.removeCart);

cartRouter.put('/' ,
    validation(CaV.clearCart),
    auth(Object.values(systemRoles)),
    CaC.clearCart);



export default cartRouter