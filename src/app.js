import express from "express"
import  cors  from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    cridentials: true
}))

app.use(express.json({limit: "1mb"}))

// url
app.use(express.urlencoded({extended:true, limit:
    "1mb"
}))


// images

app.use(express.static("public"))

app.use(cookieParser())



// routes importting

import  userRouter  from "./routes/user.routes.js"

app.use("/api/v1/users", userRouter)


export {app} 