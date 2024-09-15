import mongoose from "mongoose";

const ProductSchema  =  new  mongoose.Schema({
    descripttion: {
        type: String,
        required: true
    },
    name: {
        type: string,
        required: true
    },
    product: {
        type: string,
        rquired: true
    },
    price: {
        type: string,
        default: 0
    },
    stock: {
         default: 0,
         required: true
    },
    category: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "category",
         required: true
    },
    owner:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
    }
},{timestamps: true})


export const Product = mongoose.model("Product", ProductSchema)