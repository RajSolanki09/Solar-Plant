const mongoose = require("mongoose");

const sprinklerLeadSchema = new mongoose.Schema(
  {
    // ── CUSTOMER INFO ──────────────────────────────
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    altPhone: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    // ── SPRINKLER SPECIFIC ─────────────────────────
    landSize: {
      type: String,           // in acres or sqft
      default: null,
    },
    cropType: {
      type: String,           // What crop they grow
      default: null,
    },
    waterSource: {
      type: String,
      enum: ["Borewell", "Canal", "River", "Tank", "Other"],
      default: null,
    },
    pipeLength: {
      type: Number,           // Total pipe needed in meters
      default: null,
    },

    // ── LEAD SOURCE ────────────────────────────────
    leadSource: {
      type: String,
      enum: ["Direct", "Reference", "Online", "WhatsApp", "Other"],
      default: "Direct",
    },
    referredBy: {
      type: String,
      default: null,
    },

    // ── ASSIGNMENT ─────────────────────────────────
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── STATUS PIPELINE ────────────────────────────
    // Simpler than Solar - no portal/meter/subsidy
    status: {
      type: String,
      enum: [
        "New",              // Lead just created
        "Visit",            // Site visit scheduled/done
        "Quotation Sent",   // Quote given to customer
        "Followup",         // Following up with customer
        "Deal Done",        // Customer confirmed
        "Installation",     // System being installed
        "Payment Pending",  // Waiting for final payment
        "Completed",        // Everything done ✅
        "Cancelled",        // Lead lost ❌
      ],
      default: "New",
    },

    // ── VISIT ──────────────────────────────────────
    visitDate: {
      type: Date,
      default: null,
    },
    visitNotes: {
      type: String,
      default: null,
    },
    visitPhotos: {
      type: [String],
      default: [],
    },

    // ── QUOTATION ──────────────────────────────────
    quotationAmount: {
      type: Number,
      default: null,
    },
    quotationFile: {
      type: String,
      default: null,
    },
    quotationSentAt: {
      type: Date,
      default: null,
    },

    // ── DEAL ───────────────────────────────────────
    dealDoneAt: {
      type: Date,
      default: null,
    },
    advanceAmount: {
      type: Number,
      default: 0,
    },

    // ── INSTALLATION ───────────────────────────────
    installationDate: {
      type: Date,
      default: null,
    },
    installationTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    installationNotes: {
      type: String,
      default: null,
    },
    installationPhotos: {
      type: [String],
      default: [],
    },

    // ── PAYMENT ────────────────────────────────────
    totalAmount: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    pendingAmount: {
      type: Number,
      default: 0,             // Auto-calculated: totalAmount - paidAmount
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Complete"],
      default: "Pending",
    },

    // ── CUSTOMER REVIEW (Sprinkler only) ───────────
    reviewCode: {
      type: String,
      default: null,
      sparse: true,           // Unique only when not null
    },
    customerRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    customerReview: {
      type: String,
      default: null,
    },

    // ── NEXT FOLLOWUP ──────────────────────────────
    nextFollowupDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SprinklerLead", sprinklerLeadSchema);