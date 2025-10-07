// this is the auth middleware file
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config({ quiet: true });
// Extract token from authorization header

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access token required" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token

    const user = await User.findById(decoded.userId); // Assuming the payload contains userId

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    req.user = user; //Attach user to request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    console.error("Authentication error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const tokenGeneration = (userId) => {
  try {
    //Generate short lived access token- 15 minutes, this is for initial sign up
    const accessToken = jwt.sign(
      { userId }, // payload
      process.env.JWT_SECRET, // my key to authenticate
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" } // In case the env does not work, I default it to 15 minutes.
    );

    const refreshToken = jwt.sign(
      { userId }, //Payload
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
    );
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Internal server error", error);
    throw new Error("Failed to generate tokens");
  }
};



