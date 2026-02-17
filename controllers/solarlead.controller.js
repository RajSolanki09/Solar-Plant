const SolarLead = require("../models/solarlead.model");

// ✅ CREATE SOLAR LEAD (Admin + Sales)
exports.createLead = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      altPhone,
      email,
      address,
      city,
      state,
      pincode,
      systemSize,
      connectionType,
      currentBill,
      roofType,
      leadSource,
      referredBy,
    } = req.body;

    // Required fields check
    if (!customerName && !phone && !address && !city && !state && !pincode) {
      return res.status(400).json({
        message: "customerName, phone, address, city, state, pincode are required",
      });
    }

    const lead = await SolarLead.create({
      customerName,
      phone,
      altPhone,
      email,
      address,
      city,
      state,
      pincode,
      systemSize,
      connectionType,
      currentBill,
      roofType,
      leadSource,
      referredBy,
      createdBy: req.user._id,
      // If Sales creates lead, auto-assign to themselves
      assignedTo: req.user.role === "Sales" ? req.user._id : null,
    });

    const populatedLead = await SolarLead.findById(lead._id)
      .populate("assignedTo", "_id name phone")
      .populate("createdBy", "_id name phone");

    res.status(201).json({
      message: "Solar lead created successfully",
      lead: populatedLead,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ GET ALL SOLAR LEADS
// Admin → All leads
// Sales → Only their assigned leads
exports.getAllLeads = async (req, res) => {
  try {
    let query = {};

    // Sales sees only their own leads
    if (req.user.role === "Sales") {
      query.assignedTo = req.user._id;
    }

    // Filter by status (optional)
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by city (optional)
    if (req.query.city) {
      query.city = req.query.city;
    }

    const leads = await SolarLead.find(query)
      .populate("assignedTo", "_id name phone")
      .populate("createdBy", "_id name phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: leads.length,
      leads,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ GET SINGLE SOLAR LEAD
exports.getSingleLead = async (req, res) => {
  try {
    const lead = await SolarLead.findById(req.params.id)
      .populate("assignedTo", "_id name phone")
      .populate("createdBy", "_id name phone")
      .populate("installationTeam", "_id name phone");

    if (!lead) {
      return res.status(404).json({
        message: "Solar lead not found",
      });
    }

    // Sales can only view their own leads
    if (
      req.user.role === "Sales" &&
      lead.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ UPDATE SOLAR LEAD (Admin + Sales own lead)
// Handles ALL updates: details, status, visit,
// quotation, deal, portal, installation, meter,
// subsidy, payment - everything in one endpoint
exports.updateLead = async (req, res) => {
  try {
    const lead = await SolarLead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Solar lead not found",
      });
    }

    // Sales can only update their own leads
    if (
      req.user.role === "Sales" &&
      lead.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // Validate status if provided
    if (req.body.status) {
      const allowedStatus = [
        "New",
        "Visit",
        "Quotation Sent",
        "Followup",
        "Deal Done",
        "Portal Update",
        "Installation",
        "Meter Process",
        "Subsidy Form",
        "Payment Pending",
        "Completed",
        "Cancelled",
      ];
      if (!allowedStatus.includes(req.body.status)) {
        return res.status(400).json({
          message: "Invalid status value",
        });
      }
    }

    const updateData = req.body;

    // Auto-calculate pendingAmount if totalAmount or paidAmount changes
    if (updateData.totalAmount !== undefined || updateData.paidAmount !== undefined) {
      const totalAmount =
        updateData.totalAmount !== undefined
          ? updateData.totalAmount
          : lead.totalAmount;
      const paidAmount =
        updateData.paidAmount !== undefined
          ? updateData.paidAmount
          : lead.paidAmount;

      updateData.pendingAmount = totalAmount - paidAmount;

      // Auto-update payment status
      if (paidAmount === 0) {
        updateData.paymentStatus = "Pending";
      } else if (paidAmount < totalAmount) {
        updateData.paymentStatus = "Partial";
      } else {
        updateData.paymentStatus = "Complete";
      }
    }

    const updatedLead = await SolarLead.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("assignedTo", "_id name phone")
      .populate("createdBy", "_id name phone")
      .populate("installationTeam", "_id name phone");

    res.status(200).json({
      message: "Solar lead updated successfully",
      lead: updatedLead,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ ASSIGN LEAD TO SALES PERSON (Admin only)
exports.assignLead = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        message: "assignedTo is required",
      });
    }

    const lead = await SolarLead.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true }
    )
      .populate("assignedTo", "_id name phone")
      .populate("createdBy", "_id name phone");

    if (!lead) {
      return res.status(404).json({
        message: "Solar lead not found",
      });
    }

    res.status(200).json({
      message: "Lead assigned successfully",
      lead,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ DELETE SOLAR LEAD (Admin only)
exports.deleteLead = async (req, res) => {
  try {
    const lead = await SolarLead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Solar lead not found",
      });
    }

    res.status(200).json({
      message: "Solar lead deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};