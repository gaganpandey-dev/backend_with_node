import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new Schema({
    username: {
        type :String ,
        required : true, 
        unique : true,
        lowercase:true,
        trim: true,
        index: true // when not feel it can be unique then we use index to be search optimizes 
    }, 
     email: {
        type :String ,
        required : true, 
        unique : true,
        lowercase:true,
        trim: true,
    }, 
     fullname: {
        type :String ,
        required : true, 
        lowercase:true,
        trim: true,
        index: true
    }, 
    avatar:{
        type:String ,// cloudinary url 
        default :""
     //   required : true ,

    }, 
    coverImage:{
        type:String ,//cloudianary url
    },
    watchHistory: [

        {
             type:Schema.Types.ObjectId,
             ref:"Video"
        }
    ],
    password:{
    type:String,
    required:[true ,"Password is required "] // custum field hai jo hm require ke sath likh skte taki ek message jai user ke paas 

    }, 
    refreshToken:{
        type: String 

    }
},
    {
    timestamps:true

    }




)
userSchema.pre("save" ,async function (){
    if(!this.isModified("password")) return ; // if case yha pe isliye use hua kyu ki we dontwant to regualry update the password on everything save , we will check password toh nahi n chek hua hai toh we will do the things 
 this.password =  await bcrypt.hash(this.password,10)
 

}) // yha pe main hook ka use kiya mai chahta hu jab bhi mera data save ho mujhe yha pr e use krna hai (hook ek middleware hai jisko hmko use krnte hai to provied a before implication power jasie ki password hashinh me save ho fir dehashing me dikkat higa isiye we are using hook )
 userSchema.methods.isPasswordCorrect = async function (password){
     return await bcrypt.compare(password, this.password) // yha pe user se lega password aur dusara lega encrypted wala dono ko comapre crega now ab isme time lgta hai toh we will use async 
     // return kr dengai result after computation true or false mai match hua ya nahi  
    
 }
userSchema.methods.generateAccessToken = function(){
 return jwt.sign(
    {
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    } ,// payload ke liye ye sb diaya hai 
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
);
};

userSchema.methods.generateRefreshToken = function(){
return jwt.sign(
    {
        _id:this._id,
   
    } ,// payload ke liye ye sb diaya hai 
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}
export const User = mongoose.model("user",userSchema)
