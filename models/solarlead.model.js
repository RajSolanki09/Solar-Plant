const mongoose = require("mongoose");

const solarLeadSchema = new mongoose.Schema(
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

    // ── SOLAR SPECIFIC ─────────────────────────────
    systemSize: {
      type: Number,         // in kW (3, 5, 10 etc)
      default: null,
    },
    connectionType: {
      type: String,
      enum: ["Single Phase", "Three Phase"],
      default: null,
    },
    currentBill: {
      type: Number,         // Monthly electricity bill in ₹
      default: null,
    },
    roofType: {
      type: String,
      enum: ["RCC", "Metal Sheet", "Other"],
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
      default: null,        // Name of person who referred
    },

    // ── ASSIGNMENT ─────────────────────────────────
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,        // Sales person assigned by Admin
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,       // Who created this lead
    },

    // ── MAIN STATUS PIPELINE ───────────────────────
    status: {
      type: String,
      enum: [
        "New",              // Lead just created
        "Visit",            // Site visit scheduled/done
        "Quotation Sent",   // Quote given to customer
        "Followup",         // Following up with customer
        "Deal Done",        // Customer confirmed
        "Portal Update",    // Govt portal submission
        "Installation",     // Plant being installed
        "Meter Process",    // Meter work ongoing
        "Subsidy Form",     // Subsidy paperwork
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
      type: [String],       // Array of uploaded photo paths
      default: [],
    },

    // ── QUOTATION ──────────────────────────────────
    quotationAmount: {
      type: Number,
      default: null,
    },
    quotationFile: {
      type: String,         // PDF path
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

    // ── PORTAL ─────────────────────────────────────
    portalStatus: {
      type: String,
      enum: ["Not Started", "Submitted", "Approved", "Rejected"],
      default: "Not Started",
    },
    portalDocuments: {
      type: [String],
      default: [],
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

    // ── METER ──────────────────────────────────────
    meterNumber: {
      type: String,
      default: null,
    },
    meterAppliedAt: {
      type: Date,
      default: null,
    },
    meterInstalledAt: {
      type: Date,
      default: null,
    },

    // ── SUBSIDY ────────────────────────────────────
    subsidyAmount: {
      type: Number,
      default: 0,
    },
    subsidyStatus: {
      type: String,
      enum: ["Not Applied", "Applied", "Approved", "Received"],
      default: "Not Applied",
    },
    subsidyDocuments: {
      type: [String],
      default: [],
    },

    // ── PAYMENT SUMMARY ────────────────────────────
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
      default: 0,           // Auto-calculated: totalAmount - paidAmount
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Complete"],
      default: "Pending",
    },

    // ── NEXT FOLLOWUP ──────────────────────────────
    nextFollowupDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const SolarLead = mongoose.model('SolarLead', solarLeadSchema);
module.exports = SolarLead;