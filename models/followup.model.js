const mongoose = require("mongoose");

const followupSchema = new mongoose.Schema(
  {
    // ── WHICH LEAD ─────────────────────────────────
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    leadType: {
      type: String,
      enum: ["Solar", "Sprinkler"],
      required: true,
    },

    // ── CUSTOMER INFO ──────────────────────────────
    // Stored here so easy to show in list
    // without extra populate
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },

    // ── FOLLOWUP DETAILS ───────────────────────────
    followupDate: {
      type: Date,
      required: true,          // "Sunday 1, 9:00 PM"
    },
    notes: {
      type: String,
      default: null,           // What to discuss
    },

    // ── CUSTOMER RESPONSE ──────────────────────────
    // Filled after followup done
    customerResponse: {
      type: String,
      enum: [
        "Interested",
        "Not Interested",
        "Call Later",
        "No Response",
        "Deal Done",
        null,
      ],
      default: null,
    },
    responseNotes: {
      type: String,
      default: null,           // Detailed response notes
    },

    // ── NEXT FOLLOWUP ──────────────────────────────
    nextFollowupDate: {
      type: Date,
      default: null,
    },

    // ── STATUS ─────────────────────────────────────
    status: {
      type: String,
      enum: ["Pending", "Done", "Cancelled"],
      default: "Pending",
    },

    // ── WHO CREATED ────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Followup", followupSchema);