import { AppError } from '../../utils/classError.js'
import { asyncHandler } from "../../utils/globalErrorHandling.js"
import subCategoryModel from '../../../db/models/subCategory.model.js'
import cloudinary from '../../utils/cloudinary.js'
import { nanoid } from 'nanoid'
import slugify from 'slugify'
import { request } from 'express'
import categoryModel from '../../../db/models/category.model.js'


//================================= getSubCategories ============================

export const getSubCategories = asyncHandler(async(req,res,next)=>{
    const subCategories = await subCategoryModel.find({}).populate([
        { 
        path:"category",
        },
        {
            path:"createdBy",
        }

    ])
    res.status(201).json({msg:"done" , subCategories})
})


//================================= createSubCategory ===================================
export const createSubCategory = asyncHandler(async(req,res,next) =>{
    const {name} = req.body
    // console.log(req.params);
    // console.log(req.originalUrl);

    const categoryExist = await categoryModel.findById(req.params.categoryId)
    if(!categoryExist){
        return next(new AppError("category not exist", 409))
    }

    const subCategoryExist = await subCategoryModel.findOne({name: name.toLowerCase()})
    if(subCategoryExist){
        return next(new AppError("subCategory already exist", 409))
    }

    if(!req.file){
        return next(new AppError("Image is required", 400))
    }
    const customId = nanoid(5)

    const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path,{
        folder:`EcommerceC42/categories/${categoryExist.customId}/subCategories/${customId}`
    })

    const subCategory = await subCategoryModel.create({
        name,
        slug:slugify(name , {
            replacement:"_",
            lower:true
        }),
        image:{secure_url , public_id},
        createdBy: req.user._id,
        customId,
        category:req.params.categoryId
    })
    return res.status(201).json({msg:"done" , subCategory})
})

//================================== updateSubCategory ===================================================

export const updateSubCategory = asyncHandler(async(req,res,next)=>{
    const {name} = req.body
    const {categoryId} = req.params

    const category = await categoryModel.findOne({_id:categoryId , createdBy: req.user._id})
    if(!category){
        return next(new AppError("category not exist" , 404))
    }

    if(name){
        if(name.toLowerCase() === category.name){
            return next(new AppError("name should be different" , 400))
        }
        if(await subCategoryModel.findOne({name:name.toLowerCase()})){
            return next(new AppError("name already be different" , 409))
        }
        category.name=name.toLowerCase()
        category.slug = slugify(name, {
            replacement:"_",
            lower:true
        })
    }
    if(req.file){
        await cloudinary.uploader.destroy(category.image.public_id)
        const customId = nanoid(5)
        const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path ,{
            folder:`EcommerceC42/categories/${category.customId}/subCategories/${customId}`
        })
        category.image = {secure_url , public_id}
    }
    await category.save()
    return res.json({msg:"done",category})
})

//================================== deleteSubCategory ===================================================

export const deleteSubCategory = asyncHandler(async(req,res,next)=>{
    const {subcategoryId} = req.params

    const category = await categoryModel.findOne({_id:req.params.categoryId})

    const subCategory = await subCategoryModel.findOneAndDelete({_id:subcategoryId })
    if(!subCategory){
        return next(new AppError("category not exist" , 404))
    }
    // console.log(subcategoryId);
    // console.log(category);
    
    
    //delete image from cloudinary
    const customId = nanoid(5)
    await cloudinary.api.delete_resources_by_prefix(`EcommerceC42/categories/${category.customId}/subCategories/${subCategory.customId}`)
    await cloudinary.api.delete_folder(`EcommerceC42/categories/${category.customId}/subCategories/${subCategory.customId}`)
    return res.json({msg:"done"})
})