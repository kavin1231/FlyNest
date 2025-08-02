import express from "express";
import {
  createContact,
  getAllContacts,
  getUserContacts,
  getContactById,
  updateContactStatus,
  markContactAsRead,
  respondToContact,
  deleteContact,
  getContactStats
} from "../controllers/contactController.js";

const contactRouter = express.Router();

// Public/Customer routes
contactRouter.post("/", createContact);                    // Create contact (customer or anonymous)
contactRouter.get("/user", getUserContacts);              // Get user's own contacts (customer only)

// Admin routes
contactRouter.get("/", getAllContacts);                   // Get all contacts (admin only)
contactRouter.get("/stats", getContactStats);             // Get contact statistics (admin only)
contactRouter.get("/:id", getContactById);                // Get specific contact (admin only)
contactRouter.patch("/:id/status", updateContactStatus);  // Update contact status (admin only)
contactRouter.patch("/:id/read", markContactAsRead);      // Mark as read (admin only)
contactRouter.patch("/:id/respond", respondToContact);    // Respond to contact (admin only)
contactRouter.delete("/:id", deleteContact);              // Delete contact (admin only)

export default contactRouter;