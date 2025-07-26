import express from "express";
import {
  createBooking,
  getAllBookings,
  getMyBookings,
  cancelBooking,
  updateBookingStatus,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

bookingRouter.post("/", createBooking);
bookingRouter.get("/", getAllBookings);
bookingRouter.get("/me", getMyBookings);
bookingRouter.delete("/cancel/:id", cancelBooking);
bookingRouter.put("/:id/status", updateBookingStatus);

export default bookingRouter;
