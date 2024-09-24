import { asyncHandler } from "../utils/asyncHandelr.js";
import ApiError from "../utils/apiErrors.js";
import { User } from "../models/user.models.js";
import { uploadCloudinary } from "../utils/cloudnry.js";
import  ApiResponde  from "../utils/ApiResponse.js";



const  generateAccessAndRefreshToken = async(userId)=>{
    try {
          const user = await User.findById(userId)
          const accessToken = user.generateAccessToken()
          const refreshToken  =  user.generateRefreshToken()

          user.refreshToken = refreshToken
          await user.save({validateBeforeSave: false})

          return {accessToken,accessToken}
    } catch (error) {
        throw new ApiError(500, "something  went  wrong  while generating token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullname } = req.body;

    if ([fullname, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path.replace(/\\/g, '/');
    // const coverImageLocalPath = req.files?.coverImage[0]?.path.replace(/\\/g, '/');
    
    // console.log("files:", req.files);
 
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage)
     && req.files.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path 
    }

    
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadCloudinary(avatarLocalPath);
    // console.log("Avatar uploaded:", avatar);
    
    const coverImage = coverImageLocalPath ? await uploadCloudinary(coverImageLocalPath) : null;
    // console.log("Cover Image uploaded:", coverImage);
    

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username
    });

    const isUserCreated = await User.findById(user._id).select("-password -refreshToken");

    if (!isUserCreated) {
        throw new ApiError(500, "Something went wrong");
    }

    return res.status(201).json(
        new ApiResponde(201, isUserCreated, "USER REGISTERED SUCCESSFULLY")
    );
});


const loginUsers = asyncHandler(async(req, res)=> {
    const {  email, password, username} = req.body
    
    if(!username || !email){
        throw new ApiError (400, "username or  email is required")
    }
    
    const  user = User.findOne({
        $or : [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(400,"user  does not  exist" )  
    }
    

    const isPasswordValid = await  user.isPasswordMatch(password)

    if (!isPasswordValid) {
        throw new ApiError(400,"invalid user credentials" )  
    }
    

    const {accessToken, refreshToken}  =await generateAccessAndRefreshToken(user._id)
   
    const  logedInUser =  await user.findById(user._id).
    select("-password -refreshToken")


    const options = {
        httpOnly : true,
        secure: true
    }


    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refresh token", refreshToken, options)
    .json(
        new ApiResponde(
            200,
            {
                user : logedInUser,
                accessToken,
                refreshToken
            },
            "user logged in  Succesfully"
        )
    )
    

})

const logOut = asyncHandler(async(req, res)=> {
    
})

export { 
    registerUser,
    loginUsers
 };
