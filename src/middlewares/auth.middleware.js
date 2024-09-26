import { asyncHandler } from "../utils/asyncHandelr.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"; 
import {User} from "../models/user.models.js";
import ApiError from "../utils/apiErrors.js";

dotenv.config(); 

export const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({ message: "Unauthorized, no token provided" });
        }
    
        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET 
        );
    
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken" 
        );
    
        if (!user) {
            throw new ApiError(400, "Invalid Access Token");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(402, error.message || "Invalid Access");
    }
});
