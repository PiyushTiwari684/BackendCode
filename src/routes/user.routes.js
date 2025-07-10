import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, updatePassword } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// console.log(upload);
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
// secured routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refershToken").post(refreshAccessToken);
router.route("/updatePassword").patch(verifyJWT,updatePassword);

// router.post(
//   "/register",
//   upload.fields([
//     { name: "avatar", maxCount: 1 },
//     { name: "coverImage", maxCount: 1 },
//   ]),
//   registerUser
// );

export default router;
