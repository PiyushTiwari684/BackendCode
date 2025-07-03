import asynchandler from "express-async-handler";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const registerUser = asynchandler(async (req, res) => {
  // get user details
  const { userName, fullName, email, password } = req.body;
  // validation -> not empty
  // if(userName ==="" || fullName ==="" || email ==="" || password ==="" ) throw new ApiError(400,"All Fields are required"); this can also be used in place given below code

  if (
    [userName, fullName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(
      400,
      "All Fields are required error from line 13 controller"
    );
  }
  // user already exists check with userName and email

  const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
  if (existingUser) {
    throw new ApiError(
      409,
      "User with email or username already exists err from line 21 controller"
    );
  }
  // check for images and check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath)
    throw new ApiError(
      400,
      "Avatar file is required error from line 28 controller"
    );
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // upload them to cloudinary,check avatar is uploaded successfully

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log(avatar);
  if (!avatar)
    throw new ApiError(
      400,
      "Avatar file is required error from line 32 controller"
    );

  // not exists then create the user object
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName,
  });
  console.log(user);
  // remove passwords and refresh token fields from the response
  const createdUser = await User.findById(user._id).select(
    "-password-refreshToken"
  );

  // check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  // return res
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
