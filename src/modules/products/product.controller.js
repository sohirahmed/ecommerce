import { AppError } from '../../utils/classError.js'
import { asyncHandler } from "../../utils/globalErrorHandling.js"
import productModel from '../../../db/models/product.model.js'
import categoryModel from '../../../db/models/category.model.js'
import subCategoryModel from '../../../db/models/subCategory.model.js'
import brandModel from '../../../db/models/brand.model.js'
import cloudinary from '../../utils/cloudinary.js'
import { nanoid } from 'nanoid'
import slugify from 'slugify'
import { ApiFeatures } from '../../utils/ApiFeatures.js'



//================================= createProduct ===================================
export const createProduct = asyncHandler(async(req,res,next) =>{
    const {title,stock,discount , price , brand , subCategory , category , description} = req.body

    //check if category exist
    const categoryExist = await categoryModel.findOne({_id:category})
    if(!categoryExist){
        return next(new AppError("category not exist", 409))
    }

    //check if subCategory exist
    const subCategoryExist = await subCategoryModel.findOne({_id:subCategory,category})
    if(!subCategoryExist){
        return next(new AppError("subCategory not exist", 409))
    }

    //check if brand exist
    const brandExist = await brandModel.findOne({_id:brand})
    if(!brandExist){
        return next(new AppError("brand not exist", 409))
    }

    //check if product exist
    const productExist = await productModel.findOne({title:title.toLowerCase()})
    if(productExist){
        return next(new AppError("product already exist", 409))
    }
    const subPrice = price - (price * (discount || 0 ) / 100)

    if(!req.files){
        return next(new AppError("image is required" , 404))
    }

    const customId = nanoid(5) 
    let listArray =[]
    for (const file of req.files.coverImages){
        const{secure_url,public_id } = await cloudinary.uploader.upload(file.path,{
            folder:`EcommerceC42/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${customId}/coverImages`
        })
        listArray.push({secure_url , public_id})        
    }

    const {secure_url,public_id} = await cloudinary.uploader.upload(req.files.image[0].path,{
        folder:`EcommerceC42/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${customId}/mainImage`
    })
    
    const product = await productModel.create({
        title,
        slug:slugify(title ,{
            lower:true,
            replacement:"_"
        }),
        stock,
        discount,
        price,
        subPrice,
        brand,
        subCategory,
        category,
        description,
        coverImages:listArray,
        image:{secure_url,public_id},
        createdBy:req.user._id,
        customId
    })
    res.status(201).json({msg:"done" , product})
})

//==========================================getProducts=========================================

export const getProducts = asyncHandler(async(req,res,next)=>{

    const apiFeature = new ApiFeatures(productModel.find() ,req.query)
    .pagination()
    .filter()
    .search()
    .sort()
    .select()

    const products = await apiFeature.mongooseQuery

    res.status(200).json({msg:"done" ,page : apiFeature.page ,  products})
})
//===========================================updateProduct=========================================

export const updateProduct = asyncHandler(async(req,res,next)=>{
    const{stock , discount, price,brand,subCategory , category, description , title} = req.body
    const{id} = req.params

    //check if category exists 
    const categoryExist = await categoryModel.findOne({_id:category})
    if(!categoryExist){
        return next(new AppError("category not exist", 404))
    }

    //check if subCategory exists
    const subCategoryExist = await subCategoryModel.findOne({_id:subCategory , category})
    if(!subCategoryExist){
        return next(new AppError("subCategory not exist", 404))
    }

    //check if brand exists
    const brandExist = await brandModel.findOne({_id:brand})
    if(!brandExist){
        return next(new AppError("brand not exist", 404))
    }

    //check if product exist
    const product = await productModel.findOne({_id:id , createdBy: req.user._id})
    if(!product){
        return next(new AppError("product not exist", 404))
    }

    if(title){
        if(title.toLowerCase == product.title){
            return next(new AppError("title should be different", 400))
        }
        if(await productModel.findOne({title:title.toLowerCase()})){
            return next(new AppError("title already be exist before", 409))
        }
        product.title = title.toLowerCase()
        product.slug = slugify(title,{
            lower:true,
            replacement:"_"
        })
    }

    if(description){
        product.description = description
    }

    if(stock){
        product.stock = stock
    }

    if(price & discount){
        product.subPrice = price -(price * (discount) / 100)
        product.price = price
        product.discount = discount
    }else if(price){
        product.subPrice = price -(price * (product.discount) / 100)
        product.price = price
    }else if(discount){
        product.subPrice = product.price - (product.price * (discount /100))
        product.discount = discount
    }

    if(!req.files){
        if(req.files?.image?.length){
            await cloudinary.uploader.destroy(product.image.public_id)
            const {secure_url , public_id} = await cloudinary.uploader.upload(req.files.image[0].path,{
                folder:`EcommerceC42/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${product.customId}/mainImage`
            })
            product.image = {secure_url,public_id}
        }
        if(req.files?.coverImages?.length){
            await cloudinary.api.delete_resources_by_prefix(`EcommerceC42/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${product.customId}/coverImages`)
            let list = []
            for(const file of req.files.coverImages){
                const{secure_url , public_id} = await cloudinary.uploader.upload(file.path,{
                    folder:`EcommerceC42/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${product.customId}/coverImages`
                })
                list.push({secure_url , public_id})
            }
            product.coverImages = list
        }
    }
    
    await product.save()
    res.status(200).json({msg:"done" , product})

})