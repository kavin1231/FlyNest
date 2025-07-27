import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";
import { isItAdmin, isItCustomer } from "./userController.js";

// ✅ Create Booking – Customers Only
import { v4 as uuidv4 } from "uuid";

export async function createBooking(req, res) {
  if (!isItCustomer(req)) {
    return res.status(403).json({ error: "Only customers can book flights" });
  }

  try {
    const {
      flightId,
      seatsBooked,
      passengers,
      customerName,
      customerAddress,
      customerPhone,
    } = req.body;

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ error: "Flight not found" });
    }

    if (!passengers || passengers.length !== seatsBooked) {
      return res
        .status(400)
        .json({ error: "Passengers count must match seats booked" });
    }

    const totalAmount = flight.price * seatsBooked;

    const booking = new Booking({
      bookingId: uuidv4(),
      userEmail: req.user.email,
      flightId,
      seatsBooked,
      passengers,
      status: "preparing", // matches your schema enum
      flightDetails: {
        flightNumber: flight.flightNumber,
        departure: flight.departure,
        arrival: flight.arrival,
        date: flight.date,
        pricePerSeat: flight.price,
        image: flight.image,
      },
      totalAmount,
      customerName,
      customerAddress,
      customerPhone,
      bookingDate: new Date(),
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// ✅ Get all bookings – Admin Only
export async function getAllBookings(req, res) {
  if (!isItAdmin(req)) {
    return res.status(403).json({ error: "Only admins can view all bookings" });
  }

  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ Get bookings by user – Customer Only
export async function getBookingsByUser(req, res) {
  const { userId } = req.params;
  if (!isItCustomer(req) || req.user.id !== userId) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const bookings = await Booking.find({ user: userId });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ Admin: Update booking status
export async function updateBookingStatus(req, res) {
  if (!isItAdmin(req)) {
    return res.status(403).json({ error: "Access denied" });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!["confirmed", "cancelled", "declined"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (["cancelled", "declined"].includes(booking.status)) {
      return res
        .status(400)
        .json({ error: "Cannot update a cancelled or declined booking" });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ Customer: Cancel own booking
export async function cancelBookingByCustomer(req, res) {
  if (!isItCustomer(req)) {
    return res
      .status(403)
      .json({ error: "Only customers can cancel bookings" });
  }

  const { id } = req.params;

  try {
    const booking = await Booking.findById(id);

    if (!booking || booking.user.toString() !== req.user.id) {
      return res.status(404).json({ error: "Booking not found or not yours" });
    }

    if (["cancelled", "declined"].includes(booking.status)) {
      return res
        .status(400)
        .json({ error: "Booking is already cancelled or declined" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
