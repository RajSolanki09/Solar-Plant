const express = require("express");
const salesRouter = express.Router();

const auth = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customer.controller");

const {
  createProposal,
  getProposals,
  getProposalById,
  updateProposal,
  deleteProposal,
} = require("../controllers/proposal.controller");

// ===========================
// CUSTOMER ROUTES
// ===========================

// CREATE CUSTOMER
salesRouter.post(
  "/create-customer",
  auth,
  authorizeRoles("Sales", "Admin"),
  upload.single("image"),
  createCustomer,
);

// GET ALL CUSTOMERS
salesRouter.get(
  "/get-customer",
  auth,
  authorizeRoles("Sales", "Admin"),
  getCustomers,
);

// GET SINGLE CUSTOMER
salesRouter.get(
  "/get-customer/:id",
  auth,
  authorizeRoles("Sales", "Admin"),
  getCustomerById,
);

// UPDATE CUSTOMER
salesRouter.put(
  "/update-customer/:id",
  auth,
  authorizeRoles("Sales", "Admin"),
  upload.single("image"),
  updateCustomer,
);

// DELETE CUSTOMER
salesRouter.delete(
  "/delete-customer/:id",
  auth,
  authorizeRoles("Admin"),
  deleteCustomer,
);

// ===========================
// PROPOSAL ROUTES
// ===========================

// CREATE PROPOSAL
salesRouter.post(
  "/create-proposal",
  auth,
  authorizeRoles("Sales", "Admin"),
  createProposal,
);

// GET ALL PROPOSALS
salesRouter.get(
  "/get-proposal",
  auth,
  authorizeRoles("Sales", "Admin"),
  getProposals,
);

// GET SINGLE PROPOSAL
salesRouter.get(
  "/get-proposal/:id",
  auth,
  authorizeRoles("Sales", "Admin"),
  getProposalById,
);

// UPDATE PROPOSAL (includes status update)
salesRouter.put(
  "/update-proposal/:id",
  auth,
  authorizeRoles("Sales", "Admin"),
  updateProposal,
);

// DELETE PROPOSAL
salesRouter.delete(
  "/delete-proposal/:id",
  auth,
  authorizeRoles("Admin"),
  deleteProposal,
);

module.exports = salesRouter;
