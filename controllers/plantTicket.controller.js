const PlantTicket = require("../models/plantTicket.model");

// ✅ CREATE TICKET
exports.createTicket = async (req, res) => {
  try {
    const { ticketId, plant, issue, priority } = req.body;

    if (!ticketId || !plant || !issue) {
      return res.status(400).json({
        message: "ticketId, plant, and issue are required",
      });
    }

    // Check duplicate ticketId
    const existingTicket = await PlantTicket.findOne({ ticketId });

    if (existingTicket) {
      return res.status(409).json({
        message: "Ticket ID already exists",
      });
    }

    const ticket = await PlantTicket.create({
      ticketId,
      plant,
      issue,
      priority,
      createdBy: req.user._id,
    });

    // Populate with optimal contact information
    const populatedTicket = await PlantTicket.findById(ticket._id)
      .populate({
        path: "plant",
        select: "_id plantCapacity installationAddress",
        populate: {
          path: "customer",
          select: "_id name phone",
        },
      })
      .populate("assignedTo", "_id email phone")
      .populate("createdBy", "_id email phone");

    res.status(201).json({
      message: "Ticket created successfully",
      ticket: populatedTicket,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ GET ALL TICKETS
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await PlantTicket.find()
      .populate({
        path: "plant",
        select: "_id plantCapacity installationAddress",
        populate: {
          path: "customer",
          select: "_id name phone",
        },
      })
      .populate("assignedTo", "_id email phone")
      .populate("createdBy", "_id email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ GET SINGLE TICKET
exports.getSingleTicket = async (req, res) => {
  try {
    const ticket = await PlantTicket.findById(req.params.id)
      .populate({
        path: "plant",
        select: "_id plantCapacity installationAddress",
        populate: {
          path: "customer",
          select: "_id name phone",
        },
      })
      .populate("assignedTo", "_id email phone")
      .populate("createdBy", "_id email phone");

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ UPDATE TICKET (Includes status update and assignment)
exports.updateTicket = async (req, res) => {
  try {
    const updateData = req.body;

    // Validate status if provided
    if (updateData.status) {
      const allowedStatus = ["Open", "In Progress", "Proposed", "Resolved"];

      if (!allowedStatus.includes(updateData.status)) {
        return res.status(400).json({
          message: "Invalid status. Allowed: Open, In Progress, Proposed, Resolved",
        });
      }

      // Auto-set resolvedAt when status is Resolved
      if (updateData.status === "Resolved") {
        updateData.resolvedAt = new Date();
      }
    }

    // Auto-set status to "In Progress" when assigning
    if (updateData.assignedTo && !updateData.status) {
      updateData.status = "In Progress";
    }

    const ticket = await PlantTicket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    )
      .populate({
        path: "plant",
        select: "_id plantCapacity installationAddress",
        populate: {
          path: "customer",
          select: "_id name phone",
        },
      })
      .populate("assignedTo", "_id email phone")
      .populate("createdBy", "_id email phone");

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      message: "Ticket updated successfully",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ DELETE TICKET
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await PlantTicket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};