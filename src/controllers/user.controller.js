import asynchandler from "express-async-handler";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const generateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validationBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh tokens"
    );
  }
};

const registerUser = asynchandler(async (req, res) => {
  // get user details
  const { userName, fullName, email, password } = req.body;
  // console.log(req.body);
  // console.log("files ::",req.files)
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
  console.log("log while req.files",req.files);
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
  console.log("log while avatar",avatar);
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
  console.log("log while printing user",user);
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

const loginUser = asynchandler(async (req, res) => {
  // destructure the parameters like email and password
  const { email, password, userName } = req.body;
  console.log(req.body);
  // check user with this email name
  if (!userName && !email)
    throw new ApiError(404, "Please Give the UserName or email");
  const user = await User.findOne({ $or: [{ email }, { userName }] });
  if (!user) throw ApiError(404, "Register first to login");
  // and now compare the password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw ApiError(401, "Password incorrect");

  // if the password match, now we have to create access token and refresh since we will generate this multiple times then let create a seperate method

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshTokens(user._id);
  // send the access token,refreshToken and make the user login

  const loggedInUser = await User.findById(user._id).select(
    "-password,-refreshToken"
  );
  // we can also avoid this query with by directly updateing the values ok token in our user object

  const options = {
    httpOnly: true,
    secure: true,
  }; // these are used to ensure that the cookies can be modified by the server only

  

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,

        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successFully"
      )
    );
});

const logoutUser = asynchandler(async (req, res) => {
  // check if are having any cookies, we can logout only if the user is logged in
  // then clear cookies
  // since we are coming here through a middleware "authUser"
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  
  
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options).json(new ApiResponse(200,"User logged out Successfully"));
});

export { registerUser, loginUser, logoutUser };
