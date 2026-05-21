import { AppError } from '../../utils/classError.js'
import { asyncHandler } from "../../utils/globalErrorHandling.js"
import cloudinary from '../../utils/cloudinary.js'
import { nanoid } from 'nanoid'
import slugify from 'slugify'
import { request } from 'express'
import brandModel from '../../../db/models/brand.model.js'

//================================= getAllBrands ===================================

export const getAllBrands = asyncHandler(async(req,res,next) =>{
    const brands = await brandModel.find().sort({createdAt: -1})
    return res.json({msg:"done" , brands})
})

//================================= createBrand ===================================
export const createBrand = asyncHandler(async(req,res,next) =>{
    const {name }= req.body
    const brandExist = await brandModel.findOne({name: name.toLowerCase()})
    if(brandExist){
        return next(new AppError("brand already exist", 409))
    }
    if(!req.file){
        return next(new AppError("Image is required", 400))
    }
    const customId = nanoid(5)
    const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path,{
        folder:`EcommerceC42/Brands/${customId}`
    })

    const brand = await brandModel.create({
        name,
        slug:slugify(name , {
            replacement:"_",
            lower:true
        }),
        image:{secure_url , public_id},
        createdBy: req.user._id,
        customId
    })
    return res.status(201).json({msg:"done" , brand})
})

//================================== updateBrand===================================================

export const updateBrand = asyncHandler(async(req,res,next)=>{
    const {name} = req.body
    const {id} = req.params

    const brand = await brandModel.findOne({_id:id , createdBy: req.user._id})
    if(!brand){
        return next(new AppError("category not exist" , 404))
    }

    if(name){
        if(name.toLowerCase() === brand.name){
            return next(new AppError("name should be different" , 400))
        }
        if(await brandModel.findOne({name:name.toLowerCase()})){
            return next(new AppError("name already be different" , 409))
        }
        brand.name=name.toLowerCase()
        brand.slug = slugify(name, {
            replacement:"_",
            lower:true
        })
    }
    if(req.file){
        await cloudinary.uploader.destroy(brand.image.public_id)
        const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path ,{
            folder:`EcommerceC42/Brands/${customId}`
        })
        brand.image = {secure_url , public_id}
    }
    await brand.save()
    return res.json({msg:"done" , brand})
})

//================================== deleteBrand ===================================================

export const deleteBrand = asyncHandler(async(req,res,next)=>{
    const {id} = req.params

    const brand = await brandModel.findOneAndDelete({_id:id , createdBy: req.user._id})
    if(!brand){
        return next(new AppError("brand not exist" , 404))
    }
    //delete image from cloudinary
    const customId = nanoid(5)
    await cloudinary.api.delete_resources_by_prefix(`EcommerceC42/Brands/${brand.customId}`)
    await cloudinary.api.delete_folder(`EcommerceC42/Brands/${brand.customId}`)
    return res.json({msg:"done"})
})

