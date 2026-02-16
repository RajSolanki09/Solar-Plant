const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    salesPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    plantCapacity: {
      type: Number, // in kW
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    subsidy: {
      type: Number,
      default: 0,
    },

    finalPrice: {
      type: Number,
      required: true,
    },

    installationAddress: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Draft", "Sent", "Approved", "Rejected", "Installed"],
      default: "Draft",
    },

    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Proposal", proposalSchema);
