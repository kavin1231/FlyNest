import express from "express";
import {
  createBooking,
  cancelBookingByCustomer,
  updateBookingStatus,
  getAllBookings,
  getBookingsByUser,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

// Booking CRUD routes
bookingRouter.post("/", createBooking);
bookingRouter.get("/", getAllBookings);
bookingRouter.get("/me", getBookingsByUser);
bookingRouter.get("/user/:userId", getBookingsByUser); // Alternative route for getting user bookings
bookingRouter.delete("/:id/cancel", cancelBookingByCustomer);
bookingRouter.put("/:id/status", updateBookingStatus);

// Quote endpoint (placeholder)
bookingRouter.post("/quote", (req, res) => {
  res.status(501).json({ message: "Quote feature not implemented yet" });
});

export default bookingRouter;