import { asyncHandler} from "../utils/asyncHandlers.js";
import {ApiError} from"../utils/ApiError.js"
import { User } from "../models/user.model.js"; // ye user jo hai ye db se diret contact kr skta hai kyu ki ye mongoose se bna hai 
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
  import jwt from "jsonwebtoken";
import { response } from "express";



const generateAccessAndResponseTokens = async(userId) =>{
  try{
    const user = await User.findById(userId);
  
   const accessToken= user.generateAccessToken();
   const refreshToken= user.generateRefreshToken(); 

   user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave : false }) // db me bs new refresh token chaiye toh baar bar password yha pe n update hone ki jarurat pade isliye hm bta de rhe hai 
// kyuki bass ye kaam ho jai hmko save nahi krna isllye variable me hold nhai krta hu 
return {accessToken,
        refreshToken,
      };

  }catch(error){
    console.error("Error =>" ,error);
    throw new ApiError(500,error.message);
  }
};



const registerUser = asyncHandler(async(req ,res) =>{

   // get user details from frontend 
   // validation  - like not empty
   // check if user already exist : can be done using username and email
   // check for images , check for avtar
   // upload them to cloudinary
   // create user object - create entry in db
   // remove password and refresh token field from response 
   // check for user creation
   // return res
 


   console.log("REQ BODY =>", req.body);
    const {fullname , email ,username,password} = req.body;
    console.log("email: ", email);
    console.log({
  fullname,
  email,
  username,
  password
});

    if([fullname,email,username,password].some(
      (field) =>!field ||field?.trim() ==="")// explanation in copy
     ) {

      throw new ApiError(400, "All fields are required ")
    }
 
  const existedUser =  await  User.findOne({
       $or:[{username} ,{email}]

     })
     
     if (existedUser){
      throw new ApiError(409 ,"User with email or username already existed ")
     }
     
 const avatarLocalPath = req.files?.avatar?.[0]?.path; // here ? for option hai ya nhi, uska local path le rhe jo user avatar diya hai vo local server pe save ho rha
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

/*
====================================================
PRODUCTION VALIDATION (Future Use)
====================================================

if (!avatarLocalPath) {
  throw new ApiError(400, "Avatar file is required");
}

====================================================
*/

// avatar upload only if file exists
const avatar = avatarLocalPath
  ? await uploadOnCloudinary(avatarLocalPath)
  : null;

console.log("Avatar Response =>", avatar);

// await taki wait kre sb
const coverImage = coverImageLocalPath
  ? await uploadOnCloudinary(coverImageLocalPath)
  : null;

/*
====================================================
PRODUCTION VALIDATION (Future Use)
====================================================

if (!avatar) {
  throw new ApiError(400, "Avatar file is required");
}

====================================================
*/


const user  = await User.create({
  fullname , 
  avatar:avatar?.url ||"",
  coverImage:coverImage?.url || "", // now we have validated that we need avatar from user so we have checked that vo upload hai ki nahi lakin hmne cover image ka url manga hai agar user ne dala hai toh thik 
  // nahi toh uske jagah empty string rkh diya ahi 
  email,
  password,
  username: username.toLowerCase()
})
  
const createdUser = await User.findById(user._id).select(
  "-password -refreshToken"
)
// here above hmne created user ko check kiya uske id ke basis pe as mongodb jaise hi koi id inert hota hai toh uska vo _id kr ke bana deta hai field ussi 
// se hm check kr rhe user bna hai aur bnne ke badd selct method use kr rhe ki hmko kya chahiya , ab select lagana se sare field select h jate isliye hm jo nhi chiye uske samne - sign laga ke string me pass kr dete ahi yhi syntax hai 
if(!createdUser){
  throw new ApiError(500,"Something went wrong while registering the user ") // check hone baad user  db me create hua haiki nahi toh uske baad error throw hua hai agar nahi hua hai toh 
}

return res.status(201).json(
 new ApiResponse(200, createdUser , "User Registary successfull  ")

)

}) // yha pe hmne user ka image aur avatar check kr liya suer ne upload kiya hai ki nahi agar nahi hai uska local path error throw kro 






const loginUser = asyncHandler(async(req,res) =>{
    // request body se data laana ,
    // username aur email dono 
    // find the user  , if not found then throw error if found then ,
    // check the password 
    // access and refresh token 
    //send cookie 

    const {email , username,password} = req.body 
    if (!username && !email){ // he we want to use like we want dono me se ek toh we will write
      //if(!(username || email))
      throw new ApiError(400, " username or email is required ")
    }

   const user = await User.findOne({
  $or:[{username},{email}]  // User capital U wala mongosse ke hai we are writing here querry over it and storing in user to use it 

})

if(!user){
  throw new ApiError (400 , "user  does not exist  ")
}

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401, "Invalid user credentials ")
  }
   const {accessToken , refreshToken} = await
   generateAccessAndResponseTokens(user._id)

const loggedInUser = await User.findById(user._id).
select("-password -refreshToken")

const options = {
  httpOnly: true,
  secure :true
}
return res
.status(200)
.cookie("accessToken", accessToken ,options)
.cookie("refreshToken", refreshToken ,options)
.json(
    new ApiResponse(
      200,{
user:loggedInUser,accessToken,
refreshToken
      },
      "userlogged In seccesssfully "
    )
)


})




const logoutUser  = asyncHandler(async(req,res)=>{
     await User.findByIdAndUpdate(// find and update kyu ki we want it to get the details of user through id and update the token 
           req.user._id,
           {
  $set: {// set gives us object jo kehta hai kya kya update krna hai vo milte hi vo update kr deta hai 
     refreshToken:undefined
  }
     } ,
     {
      new:true
     }

  )
  const options ={
    httpOnly:true ,
    secure :true 
  }
  return res 
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200 ,{},"user logged out "))

})


const refreshAccessToken =asyncHandler(async(req,res) =>{
  const incomingRefreshToken = req.cookies.$or
  refreshToken || req.body.refreshToken

  if (incomingRefreshToken){
    throw new ApiError(401 ,"unauthorized request")
  }

   const decodedToken =jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  )
  const user = await User.findById(decodedToken?._id)
if(!user){
  throw new ApiError(401 ,"Invalid refresh token")
}
 if(incomingRefreshToken !== user?.refreshToken){
   throw new ApiError(401, " Refresh token is expired or used  ")
 }
 const options = {
  httpOnly :true,
  secure:true 
 }
const {accessToken, newRefreshToken}=
 await generateAccessAndResponseTokens(user._id)
 return res
 .status(200)
 .cookie("accessToken",accessToken,options)
 .cookie("refreshToken",newRefreshToken,options)
 .json(
  new ApiResponse(
    200,
      {accessToken,  refreshToken: newRefreshToken},
      "Access token refreshed" 
    
  )
 )
})



export{
  registerUser,
  loginUser , 
  logoutUser,
  refreshAccessToken
  
  
  
}

