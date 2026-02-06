const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateToken = require("../config/jwt");
const User = require("../models/user.model");

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (user.role !== role) {
            return res.status(403).json({ message: "Role mismatch" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken({ id: user._id, role: user.role });

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.register = async (req, res) => {
    try {
        const { email, password, role, phone } = req.body;

        if (!email || !password || !role || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            role,
            phone,
            profileImage: req.file ? req.file.path : null, 
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                phone: user.phone,
                profileImage: user.profileImage
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Logout successful."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};