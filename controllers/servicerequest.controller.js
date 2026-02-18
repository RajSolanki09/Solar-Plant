const ServiceRequest = require("../models/servicerequest.model");

// Helper: Generate unique service ID
const generateServiceId = async () => {
  const count = await ServiceRequest.countDocuments();
  const number = (count + 1).toString().padStart(3, "0");
  return `SRV-2024-${number}`;
};

// ✅ CREATE SERVICE REQUEST (Admin only)
exports.createService = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      address,
      city,
      linkedLeadId,
      linkedLeadType,
      issueType,
      issueDescription,
      priority,
      chargeType,
      chargeAmount,
    } = req.body;

    if (!customerName || !phone || !address || !city || !issueType || !issueDescription || !chargeType) {
      return res.status(400).json({
        message: "customerName, phone, address, city, issueType, issueDescription, chargeType are required",
      });
    }

    // Generate unique service ID
    const serviceId = await generateServiceId();

    // Set payment status based on charge type
    const paymentStatus = chargeType === "Free" ? "Not Applicable" : "Pending";

    const service = await ServiceRequest.create({
      serviceId,
      customerName,
      phone,
      address,
      city,
      linkedLeadId,
      linkedLeadType,
      issueType,
      issueDescription,
      priority,
      chargeType,
      chargeAmount: chargeType === "Free" ? 0 : chargeAmount || 0,
      paymentStatus,
      createdBy: req.user._id,
    });

    const populatedService = await ServiceRequest.findById(service._id)
      .populate("assignedTo", "_id name phone")
      .populate("createdBy", "_id name phone");

    res.status(201).json({
      message: "Service request created successfully",
      service: populatedService,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ GET ALL SERVICE REQUESTS
// Admin → All requests
// Service → Only assigned requests
exports.getAllServices = async (req, res) => {
  try {
    let query = {};

    // Service team sees only their assigned requests
    if (req.user.role === "Service") {
      query.assignedTo = req.user._id;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by charge type
    if (req.query.chargeType) {
      query.chargeType = req.query.chargeType;
    }

    // Filter by priority
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    const services = await ServiceRequest.find(query)
      .populate("assignedTo", "_id name phone")
      .populate("createdBy", "_id name phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ GET SINGLE SERVICE REQUEST
exports.getSingleService = async (req, res) => {
  try {
    const service = await ServiceRequest.findById(req.params.id)
      .populate("assignedTo", "_id name phone")
      .populate("createdBy", "_id name phone");

    if (!service) {
      return res.status(404).json({
        message: "Service request not found",
      });
    }

    // Service team can only view their assigned requests
    if (
      req.user.role === "Service" &&
      service.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ UPDATE SERVICE REQUEST
// Admin + Service (own requests only)
exports.updateService = async (req, res) => {
  try {
    const service = await ServiceRequest.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service request not found",
      });
    }

    // Service can only update their own requests
    if (
      req.user.role === "Service" &&
      service.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // Validate status if provided
    if (req.body.status) {
      const allowedStatus = ["Open", "Assigned", "In Progress", "Resolved", "Closed"];
      if (!allowedStatus.includes(req.body.status)) {
        return res.status(400).json({
          message: "Invalid status",
        });
      }

      // Auto-set resolvedAt when status is Resolved
      if (req.body.status === "Resolved" && !service.resolvedAt) {
        req.body.resolvedAt = new Date();
      }
    }

    const updateData = req.body;

    const updatedService = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("assignedTo", "_id name phone")
      .populate("createdBy", "_id name phone");

    res.status(200).json({
      message: "Service request updated successfully",
      service: updatedService,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ ASSIGN SERVICE TO TECHNICIAN (Admin only)
exports.assignService = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        message: "assignedTo is required",
      });
    }

    const service = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo,
        status: "Assigned",  // Auto-change status
      },
      { new: true }
    )
      .populate("assignedTo", "_id name phone")
      .populate("createdBy", "_id name phone");

    if (!service) {
      return res.status(404).json({
        message: "Service request not found",
      });
    }

    res.status(200).json({
      message: "Service assigned successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ ADD PAYMENT (Admin + Service)
exports.addPayment = async (req, res) => {
  try {
    const { paymentAmount, paymentMode } = req.body;

    if (!paymentAmount || !paymentMode) {
      return res.status(400).json({
        message: "paymentAmount and paymentMode are required",
      });
    }

    const service = await ServiceRequest.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service request not found",
      });
    }

    if (service.chargeType === "Free") {
      return res.status(400).json({
        message: "Cannot add payment to free service",
      });
    }

    const updatedService = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      {
        chargeAmount: paymentAmount,
        paymentStatus: "Paid",
        paymentMode,
        paymentDate: new Date(),
        status: "Closed",  // Auto-close after payment
      },
      { new: true }
    )
      .populate("assignedTo", "_id name phone")
      .populate("createdBy", "_id name phone");

    res.status(200).json({
      message: "Payment added successfully",
      service: updatedService,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ DELETE SERVICE REQUEST (Admin only)
exports.deleteService = async (req, res) => {
  try {
    const service = await ServiceRequest.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service request not found",
      });
    }

    res.status(200).json({
      message: "Service request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ UPLOAD PHOTOS (Before/After) - Admin + Service
exports.uploadPhotos = async (req, res) => {
  try {
    const { photoType } = req.body; // "before" or "after"

    if (!photoType || !["before", "after"].includes(photoType)) {
      return res.status(400).json({
        message: "photoType must be 'before' or 'after'",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No photos uploaded",
      });
    }

    const photoPaths = req.files.map((file) => file.path);

    const ServiceRequest = require("../models/servicerequest.model");

    const updateField = photoType === "before" ? "beforePhotos" : "afterPhotos";

    const service = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { $push: { [updateField]: { $each: photoPaths } } },
      { new: true }
    )
      .populate("assignedTo", "_id name phone")
      .populate("createdBy", "_id name phone");

    if (!service) {
      return res.status(404).json({
        message: "Service request not found",
      });
    }

    res.status(200).json({
      message: `${photoType} photos uploaded successfully`,
      service,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};