const express = require("express");
const adminRouter = express.Router();

const {
  createUser,
  updateStaffMember,
  deleteStaffMember,
  getAllStaff,
  getSingleStaff,
  updateStaffStatus,
  getDashboard,
} = require("../controllers/admin.controller");

const auth = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

// ✅ ADMIN DASHBOARD
adminRouter.get("/dashboard", auth, authorizeRoles("Admin"), getDashboard);

// ✅ CREATE STAFF
adminRouter.post(
  "/create-staff",
  auth,
  authorizeRoles("Admin"),
  upload.single("image"),
  createUser,
);

// ✅ GET ALL STAFF
adminRouter.get("/all-staff", auth, authorizeRoles("Admin"), getAllStaff);

// ✅ GET SINGLE STAFF (MISSING ROUTE)
adminRouter.get("/staff/:id", auth, authorizeRoles("Admin"), getSingleStaff);

// ✅ UPDATE STAFF
adminRouter.put(
  "/update-staff/:id",
  auth,
  authorizeRoles("Admin"),
  upload.single("image"),
  updateStaffMember,
);

// ✅ DELETE STAFF
adminRouter.delete(
  "/delete-staff/:id",
  auth,
  authorizeRoles("Admin"),
  deleteStaffMember,
);

module.exports = adminRouter;
