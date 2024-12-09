import { successHandler, errorHandler } from "../utils/responseHandler.js";
import { registerUser, loginUser, fetchAllUsers, fetchUserById } from "../services/userService.js";

// Get current user data
export const profile = async (req, res) => {
    try {
        const user = await fetchUserById(req.user.id);
        successHandler(res, "User fetched successfully", user);
    } catch (error) {
        errorHandler(res, "An error occurred while fetching user data", error, 500);
    }
};

// Register a new user
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const newUser = await registerUser(username, email, password);

        successHandler(
            res,
            `Account created successfully!`,
            newUser,
            201
        );
    } catch (error) {
        errorHandler(res, "Failed to register user", error, 500);
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { user, token } = await loginUser(email, password);

        successHandler(
            res,
            "You have successfully logged in.",
            { user, token },
            200
        );
    } catch (error) {
        errorHandler(res, "Failed to log in", error, 500);
    }
};

// Get all users
export const getUsers = async (req, res) => {
    try {
        const users = await fetchAllUsers();
        successHandler(res, "Users fetched successfully", users);
    } catch (error) {
        errorHandler(res, "An error occurred while fetching users", error, 500);
    }
};
