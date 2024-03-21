// require('dotenv').config

import dotenv from "dotenv"
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    //give path of env file
    path:'./.env'
})

// Error handler for the Express app
app.on("error", (error) => {
    console.error("Express app error:", error);
    process.exit(1); // Exit with failure
});

connectDB()
.then(()=>{
    app.listen(process.env.PORT ||8000,()=>{
        console.log(`Server started on port:${process.env.PORT}`);
    })
})
.catch((error)=> console.log("Mongodb connection failed !!!",error))


























// commented part is naive approach not recommended
/*
import express from "express"
const app = express()
;(async()=>{
    try {
        await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("error",error);
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`APp listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("DBEROR",error);
        throw error
        
    }
})() */