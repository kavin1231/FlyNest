import express from "express";
import {
  getAllUsers,
  getUser,
  loginUser,
  loginWithGoogle,
  registerUser,
  updateUser,
  deleteUser,
  updateProfile,
  deleteAccount,
  getUsersByRole,
  changePassword,
  uploadProfilePicture,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/all", getAllUsers);

userRouter.put("/update/:id", updateUser);
userRouter.delete("/delete/:id", deleteUser);
userRouter.put("/profile", updateProfile);
userRouter.delete("/profile", deleteAccount);
userRouter.post("/google", loginWithGoogle);
userRouter.get("/getUsersByRole/:role", getUsersByRole);
userRouter.get("/", getUser);
userRouter.post("/upload-profile-picture", uploadProfilePicture);
userRouter.post("/change-password", changePassword);

export default userRouter;
