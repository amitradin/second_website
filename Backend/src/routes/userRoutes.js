//Those will be the routes for authentication.
import express from 'express'
import { authenticateToken } from "../middleware/auth.js"
import { getUserProfile, loginUser, registerUser, refreshToken, logoutUser } from "../controllers/userController.js"

const router = express.Router();

// Public routes (no authentication needed)
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, getUserProfile);
router.post('/logout', authenticateToken, logoutUser);

export default router;
