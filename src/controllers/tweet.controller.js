import mongoose from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const createTweet = asyncHandler(async(req,res)=>{

    const user = req.user?._id
    const {content} = req.body 

    try {
        if(!content){
            throw new ApiError(400,"Please give tweet content")
        }
    
        const tweet = await Tweet.create(
            {
                content,
                user:user
            }
        );
    
        if(!tweet){
            throw new ApiError(500,"Posting Tweet  to database failed")
        }
    
        const tweetObject = await Tweet.findById(tweet?._id).select("content owner")
    
    
        return res
        .status(200)
        .json(
            new ApiResponse(200,tweetObject,"Tweet Post hogaya")
        )
    } catch (error) {
        throw new ApiError(500,"Error in creating a tweet"||error?.message)
        
    }
})

const getUserTweets = asyncHandler(async(req,res)=>{

    const {userId}= req.params
    if(!userId){
        throw new ApiError(400,"User not found")
    }
    //find all where owner matches userid
    const userTweets = await Tweet.find({owner:userId})

    if (userTweets.length === 0) {
        // Return an empty array with a message
        return res.status(200).json(new ApiResponse(200, [], "No tweets found for this user"));
    }
    
    return(
        res
        .status(200)
        .json(new ApiResponse(200,userTweets,"Tweets fetched successfully"))
    )
})
const updateTweet = asyncHandler(async(req,res)=>{
    //tweet id comes from parameter req
    //verify ownership as only owner should be able to update
    const tweetId = req.params 
    try {
        if(!tweetId)
        {
            throw new ApiError("400","TweetID not found or invalid tweet id")
        }

        //find the tweet

        const tweet = await Tweet.findById(tweetId)
        //i assume if ud exists tweet may also exist
        // if(!tweet){
        //     throw new ApiError(400,"Cant find your tweet")
        // }
        //if content passed is empty

        //find user by his request token

        const user = await User.findOne(
            {
                refreshToken:req.cookies.refreshToken
            }
        )

        if(!user){
            throw new ApiError(400,"user not found")
        }
    
        if(tweet?.owner.equals(user._id.toString()))
        {
            const {content} = req.body

            if(!content){
                return new ApiError(400,"Please give content to update")
            }

            tweet.content = content;
            await tweet.save({validateBeforeSave:false})

            return(
                res
                .status(200)
                .json(new ApiResponse(200,tweet,"tweet updated successfully"))
            )
        }
        else
        {
            throw new ApiError(400,"Only the owner can update the tweet")
        }
    
    } 
    catch (error) {
        throw new ApiError(500,`Getting error in updating tweet content ${error?.message}`,)
        
    }

})

const deleteTweet = asyncHandler(async(req,res)=>{

    // we get tweet id from req

    const {tweetId}= req.params

    if(!tweetId){
        throw new ApiError("400","TweetID not found or invalid tweet id")
    }

    //only owner of tweet can delete the tweet
    //find current user
    const user = await User.findOne(
        {
            refreshToken:req.cookies.refreshToken
        }
    )

    if(!user)
    {
        throw new ApiError(400,"User not found")
    }

    //check if current user is owner of tweet
    if(tweet?.owner.equals(user._id.toString())){
        
        await Tweet.findByIdAndDelete(tweetId)
        
        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Tweet deleted successfully")
        )
    }

    else
    {
        throw new ApiError(401,"Only owner(user) can delete the tweet")
    }

})

export {createTweet,updateTweet,deleteTweet,getUserTweets}