import express from 'express'
import * as  PC from './product.controller.js'
import { multerHost, validExtension } from '../../middleware/multer.js'
import { auth } from '../../middleware/auth.js'
import { validation } from '../../middleware/validation.js'
import * as PV from './product.validation.js'
import reviewRouter from '../review/review.routes.js'
import wishListRouter from '../wishList/wishList.routes.js'
import { systemRoles } from '../../utils/systemRoles.js'
const productRouter = express.Router()


productRouter.use('/:productId/reviews' , reviewRouter)
productRouter.use('/:productId/wishList' , wishListRouter)



productRouter.post('/' ,
    multerHost(validExtension.image).fields([
        {name :"image" , maxCount:1},
        {name:"coverImages" , maxCount:3},
    ]),
    validation(PV.createProduct),
    auth([systemRoles.admin]),
    PC.createProduct);

productRouter.get('/' , PC.getProducts)    

productRouter.put('/:id' ,
    multerHost(validExtension.image).fields([
        {name :"image" , maxCount:1},
        {name:"coverImages" , maxCount:3},
    ]),
    validation(PV.updateProduct),
    auth([systemRoles.admin]),
    PC.updateProduct);


export default productRouter