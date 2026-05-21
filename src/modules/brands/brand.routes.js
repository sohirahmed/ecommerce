import express from 'express'
import * as BC from './brand.controller.js'
import { multerHost, validExtension } from '../../middleware/multer.js'
import { auth } from '../../middleware/auth.js'
import { validation } from '../../middleware/validation.js'
import * as BV from './brand.validation.js'
import { systemRoles } from '../../utils/systemRoles.js'
const brandRouter = express.Router()

brandRouter.get('/', BC.getAllBrands)

brandRouter.post('/' ,
    multerHost(validExtension.image).single("image"),
    validation(BV.createBrand),
    auth([systemRoles.admin]),
    BC.createBrand);

    brandRouter.put('/:id' ,
        multerHost(validExtension.image).single("image"),
        validation(BV.updateBrand),
        auth([systemRoles.admin]),
        BC.updateBrand);

    brandRouter.delete('/:id' ,
        multerHost(validExtension.image).single("image"),
        validation(BV.deleteBrand),
        auth([systemRoles.admin]),
        BC.deleteBrand);

export default brandRouter