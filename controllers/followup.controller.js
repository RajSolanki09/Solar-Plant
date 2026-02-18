const Followup = require("../models/followup.model");
const SolarLead = require("../models/solarlead.model");
const SprinklerLead = require("../models/sprinklerlead.model");

// ✅ ADD FOLLOWUP TO LEAD
exports.addFollowup = async (req, res) => {
  try {
    const { leadId, leadType } = req.params;
    const { followupDate, notes, nextFollowupDate } = req.body;

    if (!followupDate) {
      return res.status(400).json({
        message: "followupDate is required",
      });
    }

    // Get lead to extract customer info
    let lead;
    if (leadType === "Solar") {
      lead = await SolarLead.findById(leadId);
    } else if (leadType === "Sprinkler") {
      lead = await SprinklerLead.findById(leadId);
    }

    if (!lead) {
      return res.status(404).json({
        message: `${leadType} lead not found`,
      });
    }

    // Sales can only add followup to their own leads
    if (
      req.user.role === "Sales" &&
      lead.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const followup = await Followup.create({
      leadId,
      leadType,
      customerName: lead.customerName,
      customerPhone: lead.phone,
      followupDate,
      notes,
      nextFollowupDate,
      createdBy: req.user._id,
    });

    // Update lead's nextFollowupDate
    if (leadType === "Solar") {
      await SolarLead.findByIdAndUpdate(leadId, { nextFollowupDate });
    } else {
      await SprinklerLead.findByIdAndUpdate(leadId, { nextFollowupDate });
    }

    const populatedFollowup = await Followup.findById(followup._id).populate(
      "createdBy",
      "_id name phone"
    );

    res.status(201).json({
      message: "Followup added successfully",
      followup: populatedFollowup,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ GET ALL FOLLOWUPS (Filtered by user role)
exports.getAllFollowups = async (req, res) => {
  try {
    let query = {};

    // Sales sees only their own followups
    if (req.user.role === "Sales") {
      query.createdBy = req.user._id;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date (today's followups)
    if (req.query.today === "true") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      query.followupDate = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    // Filter by leadType
    if (req.query.leadType) {
      query.leadType = req.query.leadType;
    }

    const followups = await Followup.find(query)
      .populate("createdBy", "_id name phone")
      .sort({ followupDate: 1 }); // Earliest first

    res.status(200).json({
      count: followups.length,
      followups,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ GET FOLLOWUPS FOR SPECIFIC LEAD
exports.getLeadFollowups = async (req, res) => {
  try {
    const { leadId } = req.params;

    const followups = await Followup.find({ leadId })
      .populate("createdBy", "_id name phone")
      .sort({ followupDate: -1 }); // Latest first

    res.status(200).json({
      count: followups.length,
      followups,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ GET SINGLE FOLLOWUP
exports.getSingleFollowup = async (req, res) => {
  try {
    const followup = await Followup.findById(req.params.id).populate(
      "createdBy",
      "_id name phone"
    );

    if (!followup) {
      return res.status(404).json({
        message: "Followup not found",
      });
    }

    // Sales can only view their own followups
    if (
      req.user.role === "Sales" &&
      followup.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json(followup);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ UPDATE FOLLOWUP (Mark Done, Change Date, Add Response)
exports.updateFollowup = async (req, res) => {
  try {
    const followup = await Followup.findById(req.params.id);

    if (!followup) {
      return res.status(404).json({
        message: "Followup not found",
      });
    }

    // Sales can only update their own followups
    if (
      req.user.role === "Sales" &&
      followup.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const updateData = req.body;

    // Validate status if provided
    if (updateData.status) {
      const allowedStatus = ["Pending", "Done", "Cancelled"];
      if (!allowedStatus.includes(updateData.status)) {
        return res.status(400).json({
          message: "Invalid status",
        });
      }
    }

    // Validate customer response if provided
    if (updateData.customerResponse) {
      const allowedResponses = [
        "Interested",
        "Not Interested",
        "Call Later",
        "No Response",
        "Deal Done",
      ];
      if (!allowedResponses.includes(updateData.customerResponse)) {
        return res.status(400).json({
          message: "Invalid customer response",
        });
      }
    }

    // Update lead's nextFollowupDate if changed
    if (updateData.nextFollowupDate) {
      if (followup.leadType === "Solar") {
        await SolarLead.findByIdAndUpdate(followup.leadId, {
          nextFollowupDate: updateData.nextFollowupDate,
        });
      } else {
        await SprinklerLead.findByIdAndUpdate(followup.leadId, {
          nextFollowupDate: updateData.nextFollowupDate,
        });
      }
    }

    const updatedFollowup = await Followup.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("createdBy", "_id name phone");

    res.status(200).json({
      message: "Followup updated successfully",
      followup: updatedFollowup,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ DELETE FOLLOWUP (Admin only)
exports.deleteFollowup = async (req, res) => {
  try {
    const followup = await Followup.findByIdAndDelete(req.params.id);

    if (!followup) {
      return res.status(404).json({
        message: "Followup not found",
      });
    }

    res.status(200).json({
      message: "Followup deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};