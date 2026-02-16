const express = require("express");
const serviceRouter = express.Router();

const auth = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

const {
  createTicket,
  getAllTickets,
  getSingleTicket,
  updateTicket,
  deleteTicket,
} = require("../controllers/plantTicket.controller");

// CREATE TICKET
serviceRouter.post(
  "/create-ticket",
  auth,
  authorizeRoles("Admin", "Sales"),
  createTicket,
);

// GET ALL TICKETS
serviceRouter.get("/get-tickets", auth, getAllTickets);

// GET SINGLE TICKET
serviceRouter.get("/get-ticket/:id", auth, getSingleTicket);

// UPDATE TICKET (includes status update and assignment)
serviceRouter.put("/update-ticket/:id", auth, updateTicket);

// DELETE TICKET (Admin only)
serviceRouter.delete(
  "/delete-ticket/:id",
  auth,
  authorizeRoles("Admin"),
  deleteTicket,
);

module.exports = serviceRouter;
