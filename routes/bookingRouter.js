import express from "express";
import {
  createBooking,
  cancelBookingByCustomer,
  updateBookingStatus,
  getAllBookings,
  getBookingsByUser,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

bookingRouter.post("/", createBooking);
bookingRouter.get("/", getAllBookings);
bookingRouter.get("/me", getBookingsByUser);
bookingRouter.patch("/:id/cancel", cancelBookingByCustomer);
bookingRouter.patch("/:id/status", updateBookingStatus);
bookingRouter.post("/quote", (req, res) => {
  res.status(501).json({ message: "Quote feature not implemented yet" });
});

export default bookingRouter;
