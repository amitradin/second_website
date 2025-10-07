import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { tokenGeneration } from '../middleware/auth.js';

export async function registerUser(req, res) {
    try {
        const { username, email, password, firstName, lastName, notification } = req.body;

        // Validate required fields
        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required (username, email, password, firstName, lastName)' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(409).json({ 
                success: false, 
                message: 'User with this email or username already exists' 
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
            notification: notification || false
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
            createdAt: newUser.createdAt
        };

        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully',
            user: userResponse,
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration' 
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
                message: 'Email and password are required' 
            });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
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
            notification: user.notification
        };

        res.status(200).json({ 
            success: true, 
            message: 'Login successful',
            user: userResponse,
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
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
            updatedAt: user.updatedAt
        };

        res.status(200).json({ 
            success: true, 
            user: userProfile 
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching profile' 
        });
    }
}

export async function refreshToken(req, res) {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ 
                success: false, 
                message: 'Refresh token is required' 
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        // Check if user still exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = tokenGeneration(user._id);

        res.status(200).json({ 
            success: true, 
            accessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Refresh token expired' 
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid refresh token' 
            });
        }
        console.error('Refresh token error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during token refresh' 
        });
    }
}

export async function logoutUser(req, res) {
    try {
        res.status(200).json({ 
            success: true, 
            message: 'Logout successful' 
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during logout' 
        });
    }
}

