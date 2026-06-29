import mongoose,{Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type : Schema.Types.ObjectId,
         // one who is subscribing 
    
        ref:"User"
    }
})


export const Subscription = mangoose.model("Subscription",subscriptionSchema)