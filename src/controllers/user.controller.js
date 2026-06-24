import { asyncHandler} from "../utils/asyncHandlers.js";
import {ApiError} from"../utils/ApiError.js"
import { User } from "../models/user.model.js"; // ye user jo hai ye db se diret contact kr skta hai kyu ki ye mongoose se bna hai 
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";



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
 
   
    const {fullname , email ,username,password} = req.body
    console.log("email: ", email);

    if([fullname,email,username,password].some((field) =>
      field?.trim() ==="")// explanation in copy
     ) {

      throw new ApiError(400, "All fields are required ")
    }
 
  const existedUser =   User.findOne({
       $or:[{username} ,{email}]

     })
     
     if (existedUser){
      throw new ApiError(409 ,"User with email or username already existed ")
     }
     


 const avatarLocalPath =    req.files?.avatar[0]?.path; // here ? for option hai ya nhi  , uska local path le rhe jo user avtar diya hai vo local server pe save ho rha 
 const coverImageLocalPath =req.files?.coverImage[0]?.path;
 
if(!avatarLocalPath){
  throw new ApiError(400, "Avatar file is required")
}
 const avatar = await uploadOnCloudinary(avatarLocalPath) // await taki wait kre sb 
 const coverImage = await uploadOnCloudinary(coverImageLocalPath)

 if (!avatar){
  throw new ApiError(400 ,"Avatar file is required") // upar path lene ke baad uska use kr ke cloudinary  pe check kiya agr yha nahi hai toh for error dalo 
 }


const user  = await User.create({
  fullName , 
  avatar:avatar.url,
  coverImage:coverImage?.url || "", // now we have validated that we need avatar from user so we have checked that vo upload hai ki nahi lakin hmne cover image ka url manga hai agar user ne dala hai toh thik 
  // nahi toh uske jagah empty string rkh diya ahi 
  email,
  password,
  username: username.toLowerCase()
})
  
const createdUser = await User.findById(user.id).select(
  "-password - refreshToken"
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

export{registerUser,}

