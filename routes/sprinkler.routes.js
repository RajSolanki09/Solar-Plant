const express = require("express");
const sprinklerRouter = express.Router();

const auth = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

const {
  createLead,
  getAllLeads,
  getSingleLead,
  updateLead,
  assignLead,
  addReview,
  deleteLead,
} = require("../controllers/sprinklerlead.controller");

// ✅ CREATE LEAD (Admin + Sales)
sprinklerRouter.post(
  "/create",
  auth,
  authorizeRoles("Admin", "Sales"),
  createLead
);

// ✅ GET ALL LEADS
// Admin → All leads
// Sales → Own leads only (filtered inside controller)
sprinklerRouter.get(
  "/all",
  auth,
  authorizeRoles("Admin", "Sales"),
  getAllLeads
);

// ✅ GET SINGLE LEAD
sprinklerRouter.get(
  "/:id",
  auth,
  authorizeRoles("Admin", "Sales"),
  getSingleLead
);

// ✅ UPDATE LEAD (details + status + any field)
sprinklerRouter.put(
  "/update/:id",
  auth,
  authorizeRoles("Admin", "Sales"),
  updateLead
);

// ✅ ASSIGN LEAD TO SALES PERSON (Admin only)
sprinklerRouter.put(
  "/assign/:id",
  auth,
  authorizeRoles("Admin"),
  assignLead
);

// ✅ ADD CUSTOMER REVIEW (Sprinkler only)
sprinklerRouter.post(
  "/review/:id",
  auth,
  authorizeRoles("Admin", "Sales"),
  addReview
);

// ✅ DELETE LEAD (Admin only)
sprinklerRouter.delete(
  "/delete/:id",
  auth,
  authorizeRoles("Admin"),
  deleteLead
);

module.exports = sprinklerRouter;