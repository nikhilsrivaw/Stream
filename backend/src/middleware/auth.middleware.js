import jwt from "jsonwebtoken";

import User from "../models/User.js";

export const protectRoute = async (req,res,next)=>{
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({message: "Unauthorized - NO token provided"});
        }
        const decoded = jwt.verify(token , process.env.JWT_SECRET_KEY);
        if(!decoded){
            return res.status(401).json({message:"Unauthorized - Invalid token"});
        }
        const user = await User.findById(decoded.userId).select("-password")

        if(!user){
            return res.status(401).json({message:"unauthorized - user not found "})
        }
        req.user= user
        next()

    } catch (error) {
        console.log("Error in protectRoute middleware")
        res.status(500).json({message:"Internal Server Error"})
        
    }

}