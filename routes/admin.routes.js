const express = require("express");
const adminRouter = express.Router();
const { 
  createUser, 
  updateStaffMember, 
  deleteStaffMember, 
  getAllStaff 
} = require("../controllers/admin.controller");
const auth = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

adminRouter.post("/create-staff", auth, isAdmin, upload.single("image"), createUser);
adminRouter.get("/all-staff", auth, isAdmin, getAllStaff);
adminRouter.put("/update-staff/:id", auth, isAdmin, upload.single("image"), updateStaffMember);
adminRouter.delete("/delete-staff/:id", auth, isAdmin, deleteStaffMember);

module.exports = adminRouter;