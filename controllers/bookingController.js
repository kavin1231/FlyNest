import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";
import { isItAdmin, isItCustomer } from "./userController.js";

// Create Booking – Only Customers
export async function createBooking(req, res) {
  if (!isItCustomer(req)) return res.status(403).json({ error: "Only customers can book flights" });

  try {
    const { flightId, seats } = req.body;
    const flight = await Flight.findById(flightId);
    if (!flight) return res.status(404).json({ error: "Flight not found" });

    const booking = new Booking({
      user: req.user.id,
      flight: flightId,
      seats,
      status: "booked"
    });

    await booking.save();
    res.status(201).json({ message: "Booking successful", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get All Bookings – Admin Only
export async function getAllBookings(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Only admins can view all bookings" });

  try {
    const bookings = await Booking.find().populate("user flight");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get My Bookings – Customer Only
export async function getMyBookings(req, res) {
  if (!isItCustomer(req)) return res.status(403).json({ error: "Only customers can view their bookings" });

  try {
    const bookings = await Booking.find({ user: req.user.id }).populate("flight");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Cancel Booking – Customer Only
export async function cancelBooking(req, res) {
  if (!isItCustomer(req)) return res.status(403).json({ error: "Only customers can cancel bookings" });

  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update Booking Status – Admin Only
export async function updateBookingStatus(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Only admins can update booking status" });

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.status = req.body.status || booking.status;
    await booking.save();

    res.status(200).json({ message: "Booking status updated", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
