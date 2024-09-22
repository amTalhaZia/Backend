import { asyncHandler } from "../utils/asyncHandelr.js";
import ApiError from "../utils/apiErrors.js";
import { User } from "../models/user.models.js";
import { uploadCloudinary } from "../utils/cloudnry.js";
import  ApiResponde  from "../utils/ApiResponse.js";

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

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.file?.coverImage[0]?.path;
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadCloudinary(coverImageLocalPath) : null;

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

export { registerUser };
