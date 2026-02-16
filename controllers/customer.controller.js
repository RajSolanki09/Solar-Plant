const Customer = require("../models/customer.model");

// ✅ CREATE CUSTOMER (Sales only)
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, city, state } = req.body;

    if (!name || !phone || !address || !city || !state) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    const customer = await Customer.create({
      name,
      phone,
      email,
      address,
      city,
      state,
      image: req.file ? req.file.path : null,
      createdBy: req.user._id,
    });

    // Populate with ID, email, and phone for quick contact
    const populatedCustomer = await Customer.findById(customer._id).populate(
      "createdBy",
      "_id email phone",
    );

    res.status(201).json({
      message: "Customer created successfully",
      customer: populatedCustomer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ GET ALL CUSTOMERS
exports.getCustomers = async (req, res) => {
  try {
    let customers;

    // Admin sees all
    if (req.user.role === "Admin") {
      customers = await Customer.find()
        .populate("createdBy", "_id email phone")
        .sort({ createdAt: -1 });
    }
    // Sales sees own customers
    else {
      customers = await Customer.find({
        createdBy: req.user._id,
      })
        .populate("createdBy", "_id email phone")
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      count: customers.length,
      customers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ GET SINGLE CUSTOMER
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate(
      "createdBy",
      "_id email phone",
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ UPDATE CUSTOMER
exports.updateCustomer = async (req, res) => {
  try {
    const updateData = req.body;

    if (req.file) {
      updateData.image = req.file.path;
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    ).populate("createdBy", "_id email phone");

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ DELETE CUSTOMER
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};