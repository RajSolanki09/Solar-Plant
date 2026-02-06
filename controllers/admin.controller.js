const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

const createUser = async (req, res) => {
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

        const newUser = await User.create({
            email,
            password: hashedPassword,
            role,
            phone,
            profileImage: req.file ? req.file.path : null,
        });

        res.status(201).json({
            message: "Staff created successfully",
            user: {
                email: newUser.email,
                role: newUser.role,
                phone: newUser.phone,
                profileImage: newUser.profileImage,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const updateStaffMember = async (req, res) => {
    try {
        const { email, role, phone } = req.body;
        const updateData = { email, role, phone };

        if (req.file) {
            updateData.profileImage = req.file.path;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ message: "Staff updated", user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const deleteStaffMember = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === req.user._id.toString()) {
            return res.status(403).json({ message: "You cannot delete yourself" });
        }

        const userToDelete = await User.findByIdAndDelete(id);
        if (!userToDelete) return res.status(404).json({ message: "Staff not found" });

        res.json({ message: `User ${userToDelete.email} deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const getAllStaff = async (req, res) => {
    try {
        const staff = await User.find().select("-password");
        res.status(200).json({ count: staff.length, staff });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    adminDashboard,
    createUser,
    updateStaffMember,
    deleteStaffMember,
    getAllStaff
};