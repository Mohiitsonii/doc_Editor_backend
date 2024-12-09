import express from 'express';
import { register, login, profile } from '../controllers/auth.controller.js';
import authenticateToken from '../middlewares/auth.middleware.js';

const userRouter = express.Router();

// Register route
userRouter.post('/register', register);

// Login route
userRouter.post('/login', login);

// Profile route (authenticated route)
userRouter.get('/profile', authenticateToken, profile);

export default userRouter;
