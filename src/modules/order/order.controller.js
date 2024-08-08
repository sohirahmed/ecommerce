import { AppError } from '../../utils/classError.js'
import { asyncHandler } from "../../utils/globalErrorHandling.js"
import cartModel from '../../../db/models/coupon.model.js'
import couponModel from '../../../db/models/coupon.model.js'
import productModel from '../../../db/models/product.model.js'
import orderModel from '../../../db/models/order.model.js'
import { createInvoice } from '../../utils/pdf.js'
import { sendEmail } from '../../service/sendEmail.js'
import { payment } from '../../utils/payment.js'
import Stripe from 'stripe'



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
    
    // await createInvoice(invoice,"invoice.pdf");

    // await sendEmail(req.user.email , "Order Placed" , `Your order has been placed successfully` , [
    //     {
    //         path:"invoice.pdf",
    //         contentType:"application/pdf"
    //     },
    //     {
    //         path:"route.jpg",
    //         contentType:"image/jpg"
    //     }
    // ])

    if(paymentMethod == "card"){

        const stripe = Stripe(process.env.stripe_secret)
        
        if(req?.body.coupon){
            const coupon = await stripe.coupons.create({
                percent_off:req.body.coupon.amount,
                duration:"once",
            })
            req.body.couponId= coupon.id
        }
        const session = await payment({
            stripe,
            payment_method_types:["card"],
            mode:"payment",
            customer_email:req.user.email,
            metadata:{
                orderId:order._id.toString()
            },
            success_url:`${req.protocol}://${req.headers.host}/orders/success/${order._id}`,
            cancel_url:`${req.protocol}://${req.headers.host}/orders/cancel/${order._id}`,
            line_items:order.products.map((product)=>{
                return{
                        price_data:{
                            currency:"egp",
                        product_data:{
                        name:product.title,
                    },
                    unit_amount:product.price * 100
                },
                quantity: product.quantity,
            }
        }),
        discounts:req.body?.coupon ?[{coupon:req.body.couponId}] :[]
    })
    return res.status(200).json({msg:"done" , url:session.url})

    }

    return res.status(200).json({msg:"done" , order})

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

//===================webhook=====================================

export const webhook = asyncHandler(async(req, res , next) => {
    const  stripe = Stripe(process.env.stripe_secret)
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.endpointSecret);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

  // Handle the event
    const {orderId} = event.date.object.metadata
    if (event.type !== "checkout.session.completed") {
        await orderModel.findOneAndUpdate({_id:orderId},{status:"rejected"})
        return res.status(400).json({msg:"fail"})
    }
    await orderModel.findOneAndUpdate({_id:orderId},{status:"placed"})
    return res.status(200).json({msg:"done"})

})

