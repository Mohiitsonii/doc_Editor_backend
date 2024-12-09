import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Register a new user
export const registerUser = async (username, email, password) => {
    // Check if user or username already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error(`A user with the email "${email}" already exists.`);
    }

    const doesUsernameExist = await User.findOne({ username });
    if (doesUsernameExist) {
        throw new Error(`The username "${username}" is already taken.`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await User.create({ email: email.toLowerCase(), password: hashedPassword, username });
    return newUser;
};

// Login a user
export const loginUser = async (email, password) => {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        throw new Error("No user found with the provided email address.");
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
        throw new Error("Incorrect password. Please try again.");
    }

    // Generate JWT
    const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });

    return { user: existingUser, token };
};

// Fetch all users
export const fetchAllUsers = async () => {
    const users = await User.find();
    if (!users.length) {
        throw new Error("No users found.");
    }
    return users;
};

// Fetch user by ID
export const fetchUserById = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found.");
    }
    return user;
};
