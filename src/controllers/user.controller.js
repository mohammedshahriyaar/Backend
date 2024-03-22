import {asyncHandler} from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import { response } from "express"

const generateAccessAndRefreshTokens=  async(userId)=>{

    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken=refreshToken
        //generally for saving mongoose mrthods kickin and ask for passowrd n all
        //as they are required so we turn of validation here by using validateBeforeSave
        await user.save({validateBeforeSave: false})

        return {accessToken,refreshToken}
        
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh tokens")
        
    }
    
}

const registerUser = asyncHandler( async(req,res)=>{


    //get user details from frontend

    const {fullName,email,username,password} = req.body
    // console.log("fullname",fullname);
    // if(fullname === ""){
    //     throw new ApiError(400,"fullname is required")

    // }

    //checking fields are empty or not
    // if(
    //     [fullName,email,username,password].some((field)=>field?.trim()==="")
    // ){
    //     throw new ApiError(400,"All fields are required")
    // }

    //checking user existence
    
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"Username with email exists")
    }

    //check for images 
    //console.log("req files",req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let  coverImageLocalPath;
    //array checks coverimage array has come ornot
    if(req.files && Array.isArray(req.files.coverImage) &&req.files.coverImage.length>0)
    {
        coverImageLocalPath= req.files.coverImage[0].path
    }

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



//////////login part


//as usual check the user fields
    //check with username that if he exist
    //password validation 
    //if exists return
//above is my approach

//login handler
const loginUser = asyncHandler( async (req,res)=>{
    //data from req body
    //check name or email
    //find user
    //password checking
    //access and refreshtoken generation
    //send cookie

    const {email,username,password} = req.body

    // if(!(username|| email)){
    //     throw new ApiError(400,"username or email is req")  
    // }
    if(!username &&  !email){
        throw new ApiError(400,"username and email is req")  
    }   


    //find uer either by email or username

    const user = await User.findOne({
        $or:[{username} ,{email}]
    })

    if(!user){
        throw new ApiError(404,"User doesn't exist")
    }

    //password validation
    //always use the user extracted from mongodb in this case  extracted at line 135 this has all the methods of our schema
    
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid Password")
    }

    //if we correctlyget password i.e user validated now we generate tokems
    //we may use these tokens in multiple places so lets write a function for their generation

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //sending in cookies
    const options ={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
                //what we are checking is if a user is trying to save 
                //aceess and refresh token
            },
            "user Logged in succesfully"
        )
    )
    
})


//logout handler

const logoutUser = asyncHandler(async(req,res)=>{
    //find user
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new:true
        }
    )

    const options ={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",options)
    .cookie("refreshToken",options)
    .json(
         new ApiResponse(
            200,
            {

            },
            "USer loggedout successfully"
            )
         )

})

//basically this refreshAccessToken whenever a users accesstoken has expired
const refreshAccessToken = asyncHandler( async(req,res)=>{
    //get refreshtoken fisrt

    const incomingRefreshToken = req.cookies.refreshToken || req.body?.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

    //verify the incoming token
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
    
        //checking if both refresh tokens are same
    
        if(incomingRefreshToken !== user?.refreshToken)
        {
            throw new ApiError(401,"Refresh token expired or used")
        }
    
        const options ={
            httpOnly:true,
            secure:true,
        }
        const {accessToken,newrefreshToken}=await generateAccessAndRefreshTokens(user._id)
    
        res.status(200)
        .cookie("accessToken",accessToken)
        .cookie("refreshToken",newrefreshToken)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    newrefreshToken
                },
                "Access token refreshed successfully "
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message ||"INvalid refresh token")
    }
})

//change password

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body
    
    const user = await  User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old password")
    }
    
    //if we reach hear we know old password is correct now we replace oldpass eith newPass

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Password changed successfull")
    )
})

//getting current USer

const getCurrentUser = asyncHandler( async (req,res)=>{
    return res
    .status(200)
    .json(
        200,req.user,"current user fetched successfully"
    )
})

//update details
const updateAccountDetails = asyncHandler( async(req,res)=>{

    const{fullName,email} = req.body
    if(!fullName || !email){
        throw new ApiError(400, "ALl fields req")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email:email
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Account details updated successfully")
    )
})

//file updates same anywhere keep it seperate decreases overload
const updateUserAvatar = asyncHandler( async(req,res)=>{
    
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Avatar while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            avatar:avatar.url
        },
        {
            new:true
        }
    ).select("-password")


    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"avatarUpdated")
    )
})

//coverImage update

const updateUserCoverImage = asyncHandler( async(req,res)=>{
    
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"CoverImage file missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading coverImage")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            coverImage:coverImage.url
        },
        {
            new:true
        }
    ).select("-password")


    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"coverImage updated")
    )


})














export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage}