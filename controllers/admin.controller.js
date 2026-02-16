const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

// ✅ CREATE STAFF
const createUser = async (req, res) => {
  try {
    const { email, password, role, phone } = req.body;

    if (!email || !password || !role || !phone) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      role,
      phone,
      image: req.file ? req.file.path : null,
      status: "Active",
    });

    res.status(201).json({
      message: "Staff created successfully",
      user: newUser,
    });
  } catch (error) {
  console.error("CREATE STAFF ERROR:", error);

  res.status(500).json({
    message: "Server error",
    error: error.message
  });
  }
};

// ✅ GET ALL STAFF
const getAllStaff = async (req, res) => {
  try {
    const staff = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      count: staff.length,
      staff,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ GET SINGLE STAFF
const getSingleStaff = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Staff not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ UPDATE STAFF
const updateStaffMember = async (req, res) => {
  try {
    const { email, role, phone } = req.body;

    const updateData = {
      email,
      role,
      phone,
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Staff not found",
      });
    }

    res.status(200).json({
      message: "Staff updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ UPDATE STAFF STATUS
const updateStaffStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Active or Inactive",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Staff not found",
      });
    }

    res.status(200).json({
      message: "Status updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ DELETE STAFF
const deleteStaffMember = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(403).json({
        message: "You cannot delete yourself",
      });
    }

    const userToDelete = await User.findByIdAndDelete(id);

    if (!userToDelete) {
      return res.status(404).json({
        message: "Staff not found",
      });
    }

    res.status(200).json({
      message: "Staff deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ ADMIN DASHBOARD
const getDashboard = async (req, res) => {
  try {
    res.status(200).json({
      message: `Hey ${req.user.role}, it's your Admin Dashboard`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createUser,
  getAllStaff,
  getSingleStaff,
  updateStaffMember,
  updateStaffStatus,
  deleteStaffMember,
  getDashboard,
};
