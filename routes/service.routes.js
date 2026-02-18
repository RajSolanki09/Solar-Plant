const express = require("express");
const serviceRouter = express.Router();

const auth = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

const {
  createService,
  getAllServices,
  getSingleService,
  updateService,
  assignService,
  addPayment,
  deleteService,
  uploadPhotos,
} = require("../controllers/servicerequest.controller");

// ✅ CREATE SERVICE REQUEST (Admin only)
serviceRouter.post(
  "/create",
  auth,
  authorizeRoles("Admin"),
  createService
);

// ✅ GET ALL SERVICE REQUESTS
// Admin → All requests
// Service → Own assigned only
serviceRouter.get(
  "/all",
  auth,
  authorizeRoles("Admin", "Service"),
  getAllServices
);

// ✅ GET SINGLE SERVICE REQUEST
serviceRouter.get(
  "/:id",
  auth,
  authorizeRoles("Admin", "Service"),
  getSingleService
);

// ✅ UPDATE SERVICE REQUEST
// Admin + Service (own only)
serviceRouter.put(
  "/update/:id",
  auth,
  authorizeRoles("Admin", "Service"),
  updateService
);

// ✅ ASSIGN SERVICE TO TECHNICIAN (Admin only)
serviceRouter.put(
  "/assign/:id",
  auth,
  authorizeRoles("Admin"),
  assignService
);

// ✅ ADD PAYMENT (Admin + Service)
serviceRouter.post(
  "/payment/:id",
  auth,
  authorizeRoles("Admin", "Service"),
  addPayment
);

// ✅ UPLOAD PHOTOS (Before/After)
// Note: Will handle multiple files
serviceRouter.post(
  "/photos/:id",
  auth,
  authorizeRoles("Admin", "Service"),
  upload.array("photos", 10), // Max 10 photos
  uploadPhotos // ← now using controller function
);

// ✅ DELETE SERVICE REQUEST (Admin only)
serviceRouter.delete(
  "/delete/:id",
  auth,
  authorizeRoles("Admin"),
  deleteService
);

module.exports = serviceRouter;