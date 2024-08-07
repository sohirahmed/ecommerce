import { AppError } from '../../utils/classError.js'
import { asyncHandler } from "../../utils/globalErrorHandling.js"
import cartModel from '../../../db/models/coupon.model .js'
import productModel from '../../../db/models/product.model.js'
import couponModel from '../../../db/models/coupon.model .js'
import orderModel from '../../../db/models/order.model.js'
import { createInvoice } from '../../utils/pdf.js'
import { sendEmail } from '../../service/sendEmail.js'


//================================= createOrder ===================================
export const createOrder = asyncHandler(async(req,res,next) =>{
    const {productId , quantity , couponCode , address , phone , paymentMethod} = req.body

    if(couponCode){
        const coupon  = await couponModel.findOne({
            code:couponCode.toLowerCase(),
            usedBy:{$nin:[req.user._id]}
        })
        if(!coupon || coupon.toDate < Date.now()){
            return next(new AppError("coupon not found or expired", 404))
        }
        req.body.coupon = coupon
    }

    let products = []
    let flag = false 
    if(productId){
        products = [{productId , quantity}]

    }else{
        const cart = await cartModel.findOne({user: req.user._id })
        if(!cart.products.length){
            return next(new AppError("cart is empty please select product" , 404))
        }
        products = cart.products
        flag = true

    }
    let finalProducts=[]
    let subPrice = 0 

    for (let product of products) {
        const checkProduct = await productModel.findOne({_id:product.productId , stock:{$gte: product.quantity}})
        if(!checkProduct){
            return next(new AppError("product not exist or out of stock", 409))
        }
        if(flag){
            product = product.toObject()
        }
        product.title = checkProduct.title
        product.price = checkProduct.price
        product.finalPrice = checkProduct.subPrice * product.quantity
        subPrice += product.finalPrice
        finalProducts.push(product)
    }

    const order = await orderModel.create({
        user:req.user._id,
        products:finalProducts,
        subPrice,
        couponId:req.body?.coupon?._id,
        totalPrice: subPrice - subPrice * (( req.body.coupon?.amount || 0) / 100 ),
        paymentMethod,
        status:paymentMethod == "cash"? "placed" :"waitPayment",
        phone,
        address
    })
    
    if(req.body?.coupon){
        await couponModel.updateOne({_id: req.body.coupon._id},{
            $push:{ usedBy: req.user._id}
        })
    }

    for (const product of finalProducts) {
        await productModel.findByIdAndUpdate({_id: product.productId},{
            $inc:{stock: -product.quantity}
        })
        
    }

    if(flag){
        await cartModel.updateOne({user:req.user._id},{products: [] })
    }

    const invoice = {
        shipping: {
            name: req.user.name,
            address: req.user.address,
            city: "Egypt",
            state: "Cairo",
            country: "cairo",
            postal_code: 94111
        },
        items: order.products,
        subtotal: subPrice,
        paid: order.totalPrice,
        invoice_nr: order._id,
        date:order.createdAt,
        coupon: req.body?.coupon?.amount || 0 
    };
    
    await createInvoice(invoice,"invoice.pdf");

    await sendEmail(req.user.email , "Order Placed" , `Your order has been placed successfully` , [
        {
            path:"invoice.pdf",
            contentType:"application/pdf"
        },
        {
            path:"route.jpg",
            contentType:"image/jpg"
        }
    ])

    res.status(200).json({msg:"done" , order})
})

//=================================cancelOrder==================================================

export const cancelOrder = asyncHandler(async(req,res,next)=>{
    const {id} = req.params 
    const {reason} = req.body
    const order = await orderModel.findOne({_id:id , user:req.user._id })
    if(!order){
        return next(new AppError("order not found" , 404))
    }

    if((order.paymentMethod === "cash" && order.status != "placed")||(order.paymentMethod === "card" && order.status != "waitPayment")){
        return next(new AppError ("you can not cancel this order" , 400))
    }
    await orderModel.updateOne({_id:id} , {
        status:"canceled",
        canceledBy:req.user._id,
        reason
    })

    if(req.body?.coupon){
        await couponModel.updateOne({_id: req.body.coupon._id},{
            $pull:{usedBy:req.user._id}
        })
    }
    for (const product of order.products) {
        await productModel.findByIdAndUpdate({_id: product.productId},{
            $inc:{stock: product.quantity}
        })
        
    }
    res.status(200).json({msg:"done" })
})



