import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import  {loginUsers, logOut, refreshToken} from "../controllers/user.controller.js"
const router = Router();
import {verifyJwt} from '../middlewares/auth.middleware.js'


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);


router.route("/login").post(loginUsers)

// secure 
router.route("/logout").post(verifyJwt, logOut)

router.route("/refresh-token").post(refreshToken)


export default router;
