const Proposal = require("../models/proposal.model");

// ✅ CREATE PROPOSAL (Sales only)
exports.createProposal = async (req, res) => {
  try {
    const {
      customer,
      plantCapacity,
      price,
      subsidy,
      installationAddress,
      notes,
    } = req.body;

    if (!customer || !plantCapacity || !price || !installationAddress) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    const finalPrice = price - (subsidy || 0);

    const proposal = await Proposal.create({
      customer,
      salesPerson: req.user._id,
      plantCapacity,
      price,
      subsidy: subsidy || 0,
      finalPrice,
      installationAddress,
      notes,
    });

    // Populate with essential contact info
    const populatedProposal = await Proposal.findById(proposal._id)
      .populate("customer", "_id name phone")
      .populate("salesPerson", "_id email phone");

    res.status(201).json({
      message: "Proposal created successfully",
      proposal: populatedProposal,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ GET ALL PROPOSALS
exports.getProposals = async (req, res) => {
  try {
    let proposals;

    // Admin sees all proposals
    if (req.user.role === "Admin") {
      proposals = await Proposal.find()
        .populate("customer", "_id name phone")
        .populate("salesPerson", "_id email phone")
        .sort({ createdAt: -1 });
    }

    // Sales sees own proposals
    else {
      proposals = await Proposal.find({
        salesPerson: req.user._id,
      })
        .populate("customer", "_id name phone")
        .populate("salesPerson", "_id email phone")
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      count: proposals.length,
      proposals,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ GET SINGLE PROPOSAL
exports.getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate("customer", "_id name phone")
      .populate("salesPerson", "_id email phone");

    if (!proposal) {
      return res.status(404).json({
        message: "Proposal not found",
      });
    }

    res.status(200).json(proposal);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ UPDATE PROPOSAL (Includes status update)
exports.updateProposal = async (req, res) => {
  try {
    const updateData = req.body;

    // Validate status if provided
    if (updateData.status) {
      const allowedStatus = [
        "Draft",
        "Sent",
        "Approved",
        "Rejected",
        "Installed",
      ];

      if (!allowedStatus.includes(updateData.status)) {
        return res.status(400).json({
          message: "Invalid status. Allowed: Draft, Sent, Approved, Rejected, Installed",
        });
      }
    }

    // Recalculate final price if price/subsidy updated
    if (updateData.price !== undefined || updateData.subsidy !== undefined) {
      const currentProposal = await Proposal.findById(req.params.id);
      
      if (!currentProposal) {
        return res.status(404).json({
          message: "Proposal not found",
        });
      }

      const price = updateData.price !== undefined ? updateData.price : currentProposal.price;
      const subsidy = updateData.subsidy !== undefined ? updateData.subsidy : currentProposal.subsidy;

      updateData.finalPrice = price - subsidy;
    }

    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    )
      .populate("customer", "_id name phone")
      .populate("salesPerson", "_id email phone");

    if (!proposal) {
      return res.status(404).json({
        message: "Proposal not found",
      });
    }

    res.status(200).json({
      message: "Proposal updated successfully",
      proposal,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ✅ DELETE PROPOSAL (Admin only)
exports.deleteProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndDelete(req.params.id);

    if (!proposal) {
      return res.status(404).json({
        message: "Proposal not found",
      });
    }

    res.status(200).json({
      message: "Proposal deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};