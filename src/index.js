// require('dotenv').config

import dotenv from "dotenv"
import mongoose from "mongoose";
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})

connectDB()


























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