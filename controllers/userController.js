import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

export function registerUser(req, res) {
  const data = req.body;
  data.password = bcrypt.hashSync(data.password, 10);
  const newUser = new User(data);

  newUser
    .save()
    .then(() => res.json({ message: "User registered successfully" }))
    .catch((error) => {
      console.error("Registration error:", error);
      res.status(500).json({ error: "User registration failed" });
    });
}

export function loginUser(req, res) {
  const data = req.body;
  User.findOne({ email: data.email })
    .then((user) => {
      if (!user) return res.status(404).json({ error: "User not found" });
      if (user.isBlocked)
        return res.status(403).json({ error: "Your account is blocked" });
      const isPasswordCorrect = bcrypt.compareSync(
        data.password,
        user.password
      );
      if (!isPasswordCorrect)
        return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign(
        {
          userId: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          phone: user.phone,
          emailVerified: user.emailVerified,
        },
        process.env.JWT_SECRET
      );

      res.json({ message: "Login successful", token, user });
    })
    .catch((error) => {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    });
}

export async function loginWithGoogle(req, res) {
  const { accessToken } = req.body;
  try {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    let user = await User.findOne({ email: response.data.email });

    if (!user) {
      user = new User({
        email: response.data.email,
        password: bcrypt.hashSync("google-oauth-user", 10),
        firstname: response.data.given_name,
        lastname: response.data.family_name,
        address: "N/A",
        phone: "N/A",
        profilePicture: response.data.picture,
        emailVerified: true,
      });
      await user.save();
    }

    const token = jwt.sign(
      {
        userId: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        phone: user.phone,
        emailVerified: true,
      },
      process.env.JWT_SECRET
    );

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ error: "Failed to login with Google" });
  }
}

export async function getAllUsers(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Unauthorized" });
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (e) {
    console.error("Get all users error:", e);
    res.status(500).json({ error: "Failed to get users" });
  }
}

export async function getUser(req, res) {
  if (!req.user) return res.status(403).json({ error: "Unauthorized" });
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json(user);
  } catch (e) {
    console.error("Get user error:", e);
    res.status(500).json({ error: "Failed to get user" });
  }
}

export async function updateProfile(req, res) {
  if (!req.user) return res.status(403).json({ error: "Unauthorized" });
  const updates = req.body;
  if (updates.password)
    updates.password = bcrypt.hashSync(updates.password, 10);

  try {
    const user = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Profile updated successfully", user });
  } catch (e) {
    console.error("Update profile error:", e);
    res.status(500).json({ error: "Failed to update profile" });
  }
}

export async function changePassword(req, res) {
  if (!req.user) return res.status(403).json({ error: "Unauthorized" });
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (e) {
    console.error("Change password error:", e);
    res.status(500).json({ message: "Password change failed" });
  }
}

export async function uploadProfilePicture(req, res) {
  if (!req.user) return res.status(403).json({ error: "Unauthorized" });
  const { imageUrl } = req.body;
  if (!imageUrl || imageUrl.trim() === "")
    return res.status(400).json({ error: "Image URL is required" });

  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { profilePicture: imageUrl },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      message: "Profile picture updated successfully",
      imageUrl: user.profilePicture,
      user,
    });
  } catch (e) {
    console.error("Upload profile picture error:", e);
    res.status(500).json({ error: "Image upload failed" });
  }
}

export async function deleteAccount(req, res) {
  if (!req.user) return res.status(403).json({ error: "Unauthorized" });
  try {
    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: "Account deleted successfully" });
  } catch (e) {
    console.error("Delete account error:", e);
    res.status(500).json({ error: "Failed to delete account" });
  }
}

export async function updateUser(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Unauthorized" });
  const { id } = req.params;
  const updates = req.body;
  if (updates.password)
    updates.password = bcrypt.hashSync(updates.password, 10);

  try {
    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User updated successfully", user });
  } catch (e) {
    console.error("Update user error:", e);
    res.status(500).json({ error: "Failed to update user" });
  }
}

export async function deleteUser(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Unauthorized" });
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (e) {
    console.error("Delete user error:", e);
    res.status(500).json({ error: "Failed to delete user" });
  }
}

export async function getUsersByRole(req, res) {
  try {
    let { role } = req.params;
    if (!role) return res.status(400).json({ error: "Role is required" });
    role = decodeURIComponent(role);

    const validRoles = ["customer", "admin"];
    if (!validRoles.includes(role))
      return res.status(400).json({ error: "Invalid role" });

    const users = await User.find({ role });
    res.json(users);
  } catch (e) {
    console.error("Get users by role error:", e);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

export function isItAdmin(req) {
  return req.user && req.user.role === "admin";
}

export function isItCustomer(req) {
  return req.user && req.user.role === "customer";
}
