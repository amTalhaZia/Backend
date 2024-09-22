import connectDb from "./db/index.js"
import dotenv from "dotenv";
import {app}  from "./app.js"
dotenv.config();


connectDb()
.then(()=> {
    app.listen(process.env.PORT || 400, () => {
        console.log(`server is  running at  port:${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log(`db  connection   failed !!: ${err}`)
})