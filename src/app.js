import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"





const app = express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true  
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true , limit:"16kb"}))
app.use(express.static("public"))// to br accessed by public 
app.use(cookieParser())


// yha se sara kaam hota hai upar ka common hi rhta hai sb me 

// routes import 
import userRouter from './routes/user.routes.js'


 // routes declaration
 app.use("/api/v1/users", userRouter) // yha ser controll user.routes me transfer hota hai 














export{app}