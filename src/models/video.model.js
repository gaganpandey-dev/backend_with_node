import mongoose, {Schema} from "mongoose";
import mongooseAggregatePagination from "mongoose-aggregate-paginate-v2";
import jwt from "jsonwebtoken";
import bcrypt from"bcrypt";






const videoSchema = new Schema(
    {
   VideoFile :{
    type:String,//cloudinary url
    required: true 
   },
   thumbnail:{
    type:String ,// cloudinary url
    required :true 

   },  
   title :{
    type:String ,
    required :true 

   }, 
    description:{
    type:String ,
    required :true 

   },
     duration:{
    type:Number , 
    required :true 

   },
    views:{
    type:Number , 
    default : 0
    }, 
    isPublished:{
      type :Boolean,
      default:true

    },
owner:{ 
    type :Schema.Types.ObjectId,
    ref:"user"// user se lega object id kyu ki owner toh apna unique rhwga aur user se hi fetch hoga 
}

},{
    timestamps: true 
}
    
)

videoSchema.plugin(mongooseAggregatePagination)


 export const Video = mongoose.model ("video", videoSchema)