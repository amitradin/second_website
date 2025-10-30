import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { tokenGeneration } from "../middleware/auth.js";


dotenv.config({ quiet: true });

export async function registerUser(req, res) {
  try {
    const { username, email, password, firstName, lastName, notification } =
      req.body;

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required (username, email, password, firstName, lastName)",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      notification: notification || false,
    });

    await newUser.save();

    // Generate tokens
    const { accessToken, refreshToken } = tokenGeneration(newUser._id);

    // Return success response (don't send password)
    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      notification: newUser.notification,
      createdAt: newUser.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = tokenGeneration(user._id);

    // Return success response (don't send password)
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      notification: user.notification,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
}

export async function getUserProfile(req, res) {
  try {
    // req.user is set by the authenticateToken middleware
    const user = req.user;

    // Return user profile (password is already excluded by the middleware)
    const userProfile = {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      notification: user.notification,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      user: userProfile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching profile",
    });
  }
}

export async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = tokenGeneration(
      user._id
    );

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during token refresh",
    });
  }
}

export async function logoutUser(req, res) {
  try {
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
}

export async function forgotPassword(req, res) {
  // method for resetting the user password
  let user;
  try {
    const { email } = req.body;
    user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Could not find a user with that email address",
      });
    }
    const resetToken = crypto.randomBytes(32).toString("hex"); // Token to reset password

    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex"); // Hashing the user password reset token feild

    const today = new Date();
    user.passwordResetExpires = today.setDate(today.getDate() + 1); // Setting the token to expire in 1 day
    await user.save(); // save the user to the database

    // Now I'll create the password reset URL for the email

    const resetUrl = `${process.env.FRONTEND_VERCEL_URL}/reset-password/${resetToken}`; // The URL for resetting the password

    const message = `Hey this is your password reset link: \n\n ${resetUrl} \n\n if you did not request this reset link, please contact Amit.`;
    const mymail = process.env.EMAIL_USER;
    const mypass = process.env.EMAIL_PASSWORD;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: mymail,
        pass: mypass,
      },
    });
    const mailOptions = {
      from: `University Task Tracker <${mymail}>`,
      to: user.email,
      subject: "Password Reset Request",
      text: message,
    };

    await transporter.sendMail(mailOptions);
    console.log("Reset URL:", resetUrl);

    res.status(200).json({
      success: true,
      message: "If a user with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    if (user && user.passwordResetToken) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
    }
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
}

export async function resetPassword(req, res) {
  // the request that is made from the reset password link
  try {
    const { token } = req.params;
    const { newPass } = req.body;

    if (!newPass || newPass.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password is required and must be at least 6 characters long",
      });
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // make sure token is not expired
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token is invalid or expired",
      });
    }
    // user is found, time to hash the new password.
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPass, saltRounds);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
}

export async function toggleNotifications(req, res) {
  try{
    const user = req.user;
    const { enabled } = req.body;
    user.notification = enabled;
    await user.save();
    res.status(200).json({
      success: true,
      message: `Notifications have been ${enabled ? "enabled" : "disabled"}.`,
    });
  } catch (error) {
    console.error("Toggle notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during notifications toggle",
    });
  }
}
