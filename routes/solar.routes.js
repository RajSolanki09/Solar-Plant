const express = require("express");
const solarRouter = express.Router();

const auth = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

const {
  createLead,
  getAllLeads,
  getSingleLead,
  updateLead,
  assignLead,
  deleteLead,
} = require("../controllers/solarlead.controller");

// ✅ CREATE LEAD (Admin + Sales)
solarRouter.post("/create", auth, authorizeRoles("Admin", "Sales"), createLead);

// ✅ GET ALL LEADS
// Admin → All leads
// Sales → Own leads only (filtered inside controller)
solarRouter.get("/all", auth, authorizeRoles("Admin", "Sales"), getAllLeads);

// ✅ GET SINGLE LEAD
solarRouter.get("/:id", auth, authorizeRoles("Admin", "Sales"), getSingleLead);

// ✅ UPDATE LEAD (details + status + any field)
solarRouter.put(
  "/update/:id",
  auth,
  authorizeRoles("Admin", "Sales"),
  updateLead,
);

// ✅ ASSIGN LEAD TO SALES PERSON (Admin only)
solarRouter.put("/assign/:id", auth, authorizeRoles("Admin"), assignLead);

// ✅ DELETE LEAD (Admin only)
solarRouter.delete("/delete/:id", auth, authorizeRoles("Admin"), deleteLead);

module.exports = solarRouter;
