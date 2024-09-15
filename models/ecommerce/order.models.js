import mongoose, { Types } from "mongoose";

const orderItems = new mongoose.Schema({
    productId: {
        types: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    quantity: {
        types: Number,
        required: true
    }
})

const  orderSchema =  new  mongoose.Schema({
    ordrePrice: {
        type:  Number,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    orderItems: {
        type: [orderItems]
    },
    adress: {
        type: String,
        required: true
    },
    status: {
        types: String,
        enum: ["pending", "cancelled", "delievered"],
        default: "pending"
    }
},{timestamps:true})

export const Order = mongoose.model("Order",orderSchema)