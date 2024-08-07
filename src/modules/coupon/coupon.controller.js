import { AppError } from '../../utils/classError.js'
import { asyncHandler } from "../../utils/globalErrorHandling.js"
import couponModel from '../../../db/models/coupon.model .js'

//================================= getCoupon ===================================

export const getAllCoupons = asyncHandler(async(req,res,next) =>{
    const coupons = await couponModel.find({})
    return res.json({msg:"done", coupons})
})

//================================= createCoupon ===================================
export const createCoupon = asyncHandler(async(req,res,next) =>{
    const {code , amount , fromDate , toDate  } = req.body
        
    const couponExist = await couponModel.findOne({code: code.toLowerCase()})
    if(couponExist){
        return next(new AppError("coupon already exist", 409))
    }

    const coupon = await couponModel.create({
        code: code.toLowerCase(),
        amount,
        fromDate,
        toDate,
        createdBy:req.user._id

    })
    
    return res.status(201).json({msg:"done" , coupon})
})
//================================== updateCoupon ===================================================
export const updateCoupon = asyncHandler(async(req,res,next) =>{
    const {id} = req.params
    const {code , amount , fromDate , toDate  } = req.body

    const coupon = await couponModel.findOneAndUpdate(
        {_id:id , createdBy: req.user._id},
        {
        code,
        amount,
        fromDate,
        toDate
    },{
        new:true
    })
    if(!coupon){
        return next(new AppError("coupon not exist or you don't have permission ", 409))
    }

    return res.status(201).json({msg:"done" , coupon})
})




