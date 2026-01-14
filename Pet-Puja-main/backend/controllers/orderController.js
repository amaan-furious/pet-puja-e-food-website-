import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import resazorpay from "razorpay"


//placing using from frontend

const placeOrder = async(req,res)=>{
    try {
        const newOrder=new orderModel({
            userId:req.body.userId,
            items:req.body.items,
            amount:req.body.amount,
            address:req.body.address,
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}});
        const line_items=req.body.items.map((item)=>({
            price_data:{
                currency:"inr",
                product_data:{
                    name:item.name
                },
                unit_amount:item.price*100
            },
            quantity:item.quantity
        }))
        res.json({success:true,session_url:`/verify?success=true&orderId=${newOrder._id}`})

    } catch (error) {
        console.log(error);
        res.send({success:false,message:"error"});
    }
}

const verifyOrder=async(req,res)=>{
    const {orderId,success}=req.body;
    try {
        if(success=="true"){
            await orderModel.findByIdAndUpdate(orderId,{payment:true})
            res.json({success:true,message:"paid"});
        }
        else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({success:false,message:"not paid"});
        }
    } catch (error) {
        console.log(error)
        res.json({success:false,message:"error"});
    }
}

export {placeOrder,verifyOrder}