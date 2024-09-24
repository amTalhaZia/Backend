import { asyncHandler } from "../utils/asyncHandelr";


export const  verifyJwt =  asyncHandler(async(req, res,next)=>{
    req.cookies?.accessToken || req.header("Authorization")?
})