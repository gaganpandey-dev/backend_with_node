//require('dotenv').config({path: './env'})  yhi hai env file ko import krne ka tarkia lakin kyu ki we are using import aur require nahi toh hm isko bhi import me use krengai vaise y sehi hai no errror 

import dotenv from"dotenv"
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config ({
    path: './.env'
    })

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,() =>{
 console.log(` server is running at port :${process.env.PORT}`);
    })
})
.catch((err) =>{
    console.log("MONGODB connection failed !!" , err);
})






















 /* BASIC APPROACH TO CONNECT WITH BACKEND  yha pe sara chiz hm index.js me likh diye hai lakin for biiger industry uses we need to put in db folder 
import express  from "express"
const app = express()



( async () =>{
    try {
        await mongoose.connect(`${process.env.
            MONGODB_URI}/${DB_NAME}`)
            app.on("error",()=>{
                console.log("error : ", error);
                throw error
            })
            app.listen(process.env.PORT ,()=>{
                console.log(`App is listening on port ${PORT}`)
            })
    } catch (error) {
        console.error("ERROR: ",error)
        throw error
    }
}) */