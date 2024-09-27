import { asyncHandler } from "../utils/asyncHandelr.js"
import dotenv from "dotenv";
import ApiError from "../utils/apiErrors.js";
import { User } from "../models/user.models.js";
import { uploadCloudinary } from "../utils/cloudnry.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

dotenv.config();

// Generate access and refresh tokens for the user
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating token");
    }
};

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullname } = req.body;

    if ([fullname, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path.replace(/\\/g, '/');

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
        throw new ApiError(400, "Avatar file upload failed");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username,
    });

    const isUserCreated = await User.findById(user._id).select("-password -refreshToken");

    if (!isUserCreated) {
        throw new ApiError(500, "Something went wrong");
    }

    return res.status(201).json(new ApiResponse(201, isUserCreated, "USER REGISTERED SUCCESSFULLY"));
});

// Login a user
const loginUsers = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordMatch(password);

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

// Log out a user
const logOut = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true });

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Refresh token
const refreshToken = asyncHandler(async (req, res) => {
    try {
        const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingToken) {
            throw new ApiError(401, "Unauthorized access");
        }

        const decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decoded?._id);

        if (!user) {
            throw new ApiError(401, "Invalid user");
        }

        if (incomingToken !== user.refreshToken) {
            throw new ApiError(401, "Expired or invalid refresh token");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { refreshToken: refreshNewToken, accessToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshNewToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: refreshNewToken,
                    },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, error?.message);
    }
});

// Change user password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordMatch(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, "Password changed successfully"));
});

// Get current user
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// Update user account details
const updateAccount = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;

    if (!fullname || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { fullname, email } },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account updated successfully"));
});

// Update user avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar field is required");
    }

    const avatar = await uploadCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { avatar: avatar.url },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, user,"Avatar updated successfully"));
});




export {
    registerUser,
    loginUsers,
    logOut,
    refreshToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccount,
    updateUserAvatar,
    getUserChannelProfile
};
