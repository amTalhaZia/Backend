import mongoose from "mongoose";

const connectDb = async () => {
    try {
        const con =  await mongoose.connect(`${process.env.MONGO_URI}`)
        console.log("mongoose db connnected",con.connection.host);
        
    } catch (error) {
        console.log(`mongoose connection error:",${error.message}`);
        process.exit(1)
    }
}


export default connectDb