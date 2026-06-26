import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";



const router = Router()

router.route("/register").post(
    upload.fields
 ([{

name: "avatar",
maxCount:1

 },
 { name:"coverImage",
    maxCount:1

 } //middleware ka use kr kr rhe hai malter yha pe hm do files uplad kr rhe ek ka nam hai avtar aur dusara coverimage dono ka max limit hai 1 ek se jyada nhi
 



]),registerUser) ;




export  default router;