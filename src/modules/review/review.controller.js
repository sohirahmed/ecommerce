import { AppError } from '../../utils/classError.js'
import { asyncHandler } from "../../utils/globalErrorHandling.js"
import reviewModel from '../../../db/models/review.model.js'
import productModel from '../../../db/models/product.model.js'
import orderModel from '../../../db/models/order.model.js'


//================================= createReview===================================
export const createReview = asyncHandler(async(req,res,next) =>{
    const {comment , rate } = req.body
    const {productId} = req.params

//check product
    const product = await productModel.findById(productId)
    if(!product){
        return next(new AppError("product not exist", 409))
    }

//check review    
    const reviewExist = await reviewModel.findOne({createdBy:req.user._id , productId})
    if(reviewExist){
        return next(new AppError("you have already reviewed this product", 409))
    }

//check order    
    const order = await orderModel.findOne({
        user:req.user._id,
        "products.productId":productId,
        status:"delivered"
    })
    if(!order){
        return next (new AppError("order not found" , 409))
    }

    const review = await reviewModel.create({
        comment,
        rate,
        productId,
        createdBy:req.user._id
    })

    const reviews = await reviewModel.find({productId})
    // let sum = 0
    // for (const review of reviews) {
    //     sum += review.rate
    // }
    // product.ratingAvg = sum / reviews.length

    let sum = product.ratingAvg * product.rateNum
    sum = sum + rate

    product.ratingAvg = sum /( product.rateNum +1)
    product.rateNum +=1

    await product.save()

    return res.status(201).json({msg:"done" , review})
})


//===================================deleteReview=======================================

export const deleteReview = asyncHandler(async(req,res,next)=>{
    const{id} = req.params

    const review = await reviewModel.findByIdAndDelete({
        _id:id,
        createdBy:req.user._id
    })
    if(!review){
        return next(new AppError("review not found", 404))
    }
    const product = await productModel.findById(review.productId)

    let sum = product.ratingAvg * product.rateNum
    sum = sum - review.rate

    product.ratingAvg = sum /( product.rateNum -1)
    product.rateNum -=1

    await product.save()

    return res.status(201).json({msg:"done" , review})

})

