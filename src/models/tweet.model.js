import mongoose,{Mongoose, Schema}  from "mongoose"

const tweetSchema = new Schema(
    {
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        content:
        {
            type:"string",
            required:true
        }
    },
    {
        timestamps:true
    }
)


export const Tweet = mongoose.model("Tweet",tweetSchema)