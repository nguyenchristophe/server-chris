import express from "express";
import {
  changePassword,
  forgetpassword,
  getMyProfile,
  login,
  logOut,
  resetpassword,
  signup,
  updatePic,
  updateProfile,
  updateSubscription
} from "../controllers/user.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";


const router = express.Router();

router.put("/update-subscription", isAuthenticated, updateSubscription);

router.post("/login", login);

router.post("/new", singleUpload, signup);

router.get("/me", isAuthenticated, getMyProfile);
router.get("/logout", isAuthenticated, logOut);

// Updating Routes
router.put("/updateprofile", isAuthenticated, updateProfile);
router.put("/changepassword", isAuthenticated, changePassword);
router.put("/updatepic", isAuthenticated, singleUpload, updatePic);
router.put("/update-subscription", isAuthenticated, updateSubscription);

// Forget Password & Reset Password
router.route("/forgetpassword").post(forgetpassword).put(resetpassword);

export default router;
