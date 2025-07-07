import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    

    // res can be replaced here by _ (underscore) and this can seen production grade code since this middleware do not send any response 
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    
    console.log("Access Token:", token);
    if (!token) throw new ApiError(401, "Unauthorized Request");
    
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
    const user = await User.findById(decodedToken?._id).select(
      "-password,-refreshToken"
    );
  
    if (!user)
      throw new ApiError(401, "Invalid Access token from authmiddleware");
  
    req.user = user;
  

    next();
  } catch (error) {
    throw new  ApiError(401,error?.message || "Invalid Access Token");
  }
});
