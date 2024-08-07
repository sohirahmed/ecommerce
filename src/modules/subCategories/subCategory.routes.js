import express from 'express'
import * as  SCC from './subCategory.controller.js'
import { multerHost, validExtension } from '../../middleware/multer.js'
import { auth } from '../../middleware/auth.js'
import { validation } from '../../middleware/validation.js'
import * as SCV from './subCategory.validation.js'
import { systemRoles } from '../../utils/systemRoles.js'
const subCategoryRouter = express.Router({ mergeParams: true})


subCategoryRouter.get('/',
    auth(Object.values(systemRoles)),
    SCC.getSubCategories)

subCategoryRouter.post('/' ,
    multerHost(validExtension.image).single("image"),
    validation(SCV.createSubCategory),
    auth([systemRoles.admin]),
    SCC.createSubCategory);

    subCategoryRouter.put('/:id' ,
        multerHost(validExtension.image).single("image"),
        validation(SCV.updateSubCategory),
        auth([systemRoles.admin]),
        SCC.updateSubCategory);

subCategoryRouter.delete('/:subcategoryId',
    auth(Object.values(systemRoles)),
    SCC.deleteSubCategory);


export default subCategoryRouter