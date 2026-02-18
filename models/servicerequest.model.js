const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    // ── UNIQUE SERVICE ID ──────────────────────────
    serviceId: {
      type: String,
      required: true,
      unique: true,            // "SRV-2024-001"
    },

    // ── CUSTOMER INFO ──────────────────────────────
    customerName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },

    // ── LINK TO EXISTING LEAD (Optional) ───────────
    linkedLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    linkedLeadType: {
      type: String,
      enum: ["Solar", "Sprinkler", null],
      default: null,
    },

    // ── ISSUE DETAILS ──────────────────────────────
    issueType: {
      type: String,
      enum: [
        "No Power Generation",
        "Inverter Error",
        "Panel Damage",
        "Wiring Issue",
        "Meter Issue",
        "Cleaning Required",
        "Sprinkler Blockage",
        "Pipe Damage",
        "Motor Issue",
        "Other",
      ],
      required: true,
    },
    issueDescription: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    // ── CHARGE TYPE ────────────────────────────────
    chargeType: {
      type: String,
      enum: ["Free", "Paid"],
      required: true,
    },
    chargeAmount: {
      type: Number,
      default: 0,              // 0 if free
    },

    // ── ASSIGNMENT ─────────────────────────────────
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,           // Service technician
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── STATUS ─────────────────────────────────────
    status: {
      type: String,
      enum: [
        "Open",              // Just created
        "Assigned",          // Technician assigned
        "In Progress",       // Tech working
        "Resolved",          // Issue fixed
        "Closed",            // Payment done & closed
      ],
      default: "Open",
    },

    // ── SERVICE VISIT ──────────────────────────────
    serviceDate: {
      type: Date,
      default: null,
    },
    serviceNotes: {
      type: String,
      default: null,
    },

    // ── PHOTOS ─────────────────────────────────────
    beforePhotos: {
      type: [String],
      default: [],
    },
    afterPhotos: {
      type: [String],
      default: [],
    },

    // ── RESOLUTION ─────────────────────────────────
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: null,
    },

    // ── PAYMENT (if Paid service) ──────────────────
    paymentStatus: {
      type: String,
      enum: ["Not Applicable", "Pending", "Paid"],
      default: "Not Applicable",  // "Not Applicable" if free
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "Online", "UPI", null],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);