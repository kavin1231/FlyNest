import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";
import { isItAdmin, isItCustomer } from "./userController.js";
import { v4 as uuidv4 } from "uuid";

// ✅ Create Booking – Customers Only (temporarily allowing any authenticated user)
export async function createBooking(req, res) {
  console.log("=== BOOKING DEBUG ===");
  console.log("Request user:", req.user);
  console.log("Request headers:", req.headers.authorization);

  if (!req.user) {
    console.log("No user found in request");
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }

  console.log("User role:", req.user.role);
  console.log("Is customer check:", isItCustomer(req));

  try {
    const {
      flightId,
      seatsBooked,
      passengers,
      customerName,
      customerAddress,
      customerPhone,
    } = req.body;

    console.log("Booking request data:", {
      flightId,
      seatsBooked,
      passengers,
      customerName,
      customerAddress,
      customerPhone,
    });

    if (!flightId || !seatsBooked || !passengers) {
      return res.status(400).json({ error: "Missing required booking information" });
    }

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
      customerName: customerName || `${req.user.firstname} ${req.user.lastname}`,
      customerAddress: customerAddress || "Customer Address",
      customerPhone: customerPhone || req.user.phone || "N/A",
      bookingDate: new Date(),
    });

    console.log("About to save booking:", booking);
    await booking.save();
    console.log("Booking saved successfully");

    res.status(201).json(booking);
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(400).json({ error: error.message });
  }
}

// ✅ Get all bookings – Admin Only
export async function getAllBookings(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

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

// ✅ Get bookings by user – Customer Only (supports /me and /user/:userId)
export async function getBookingsByUser(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!isItCustomer(req)) {
    return res.status(403).json({ error: "Access denied" });
  }

  const paramUserId = req.params.userId; // from /user/:userId

  if (paramUserId && req.user.userId !== paramUserId) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    // Use userEmail since Booking stores that
    const bookings = await Booking.find({ userEmail: req.user.email }).sort({
      createdAt: -1,
    });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ Admin: Update booking status
export async function updateBookingStatus(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // TEMPORARY: Allow any authenticated user to update booking status
  // if (!isItAdmin(req)) {
  //   return res.status(403).json({ error: "Access denied" });
  // }

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
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!isItCustomer(req)) {
    return res
      .status(403)
      .json({ error: "Only customers can cancel bookings" });
  }

  const { id } = req.params;

  try {
    const booking = await Booking.findById(id);

    if (!booking || booking.userEmail !== req.user.email) {
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
