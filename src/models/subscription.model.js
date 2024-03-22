import mongoose ,{Schema} from "mongoose"

const subscriptionSchema = new Schema(
    {

        subscriber:{
            type:Schema.Types.ObjectId, //one who is susbscribing
            ref:"User"
        },
        channel:{
            type:Schema.Types.ObjectId, //one to whom a user is susbscribing
            ref:"User"
        }
    },
    {
    timestamps:true
    }
)



export const Subscription = mongoose.model("Subscription",subscriptionSchema)