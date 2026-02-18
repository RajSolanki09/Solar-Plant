const express = require("express");
const followupRouter = express.Router();

const auth = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

const {
  addFollowup,
  getAllFollowups,
  getLeadFollowups,
  getSingleFollowup,
  updateFollowup,
  deleteFollowup,
} = require("../controllers/followup.controller");

// ✅ ADD FOLLOWUP TO LEAD (Admin + Sales)
// leadType: Solar or Sprinkler
followupRouter.post(
  "/add/:leadType/:leadId",
  auth,
  authorizeRoles("Admin", "Sales"),
  addFollowup
);

// ✅ GET ALL FOLLOWUPS
// Admin → All followups
// Sales → Own followups only
// Query params: ?status=Pending, ?today=true, ?leadType=Solar
followupRouter.get(
  "/all",
  auth,
  authorizeRoles("Admin", "Sales"),
  getAllFollowups
);

// ✅ GET FOLLOWUPS FOR SPECIFIC LEAD
followupRouter.get(
  "/lead/:leadId",
  auth,
  authorizeRoles("Admin", "Sales"),
  getLeadFollowups
);

// ✅ GET SINGLE FOLLOWUP
followupRouter.get(
  "/:id",
  auth,
  authorizeRoles("Admin", "Sales"),
  getSingleFollowup
);

// ✅ UPDATE FOLLOWUP
// Mark Done, Change Date, Add Response
followupRouter.put(
  "/update/:id",
  auth,
  authorizeRoles("Admin", "Sales"),
  updateFollowup
);

// ✅ DELETE FOLLOWUP (Admin only)
followupRouter.delete(
  "/delete/:id",
  auth,
  authorizeRoles("Admin"),
  deleteFollowup
);

module.exports = followupRouter;