import {asyncHandler} from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const registerUser = asyncHandler( async(req,res)=>{

    //get user details from frontend

    // const {fullname,email,username,password} = req.body
    // console.log("fullname",fullname);
    // if(fullname === ""){
    //     throw new ApiError(400,"fullname is required")

    // }

    //checking fields are empty or not
    if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    }

    //checking user existence
    
    const existedUser = User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"Username with email exists")
    }

    //check for images 
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0].path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }
    //upload  to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    //create an objext and create entry to database
    //this takes time so pakka async
    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"something went wrong while creating user")
    }

    //IF CODE REACHhes here it means user created succesfully

    return res.status(201).json(
        new ApiResponse(200,createdUser,"USer created successfully")
    )




})

export {registerUser}


// 4  general steps acc to me
//collect all fields from front end or whatever
//check if all of them are present-->validation also
//user exitsence check
//if images involved check their upload issues
//sennd to db

//but for this what we shall do
// get user details from frontend depending on schema
//validate -- if not empty
//check if user exists :email,username
//check for images,
//upload to cloud,check uploaded or not
//create user object - create entry in database
//remove pwd and refreshtoken from response
//check for user creation
//return response

