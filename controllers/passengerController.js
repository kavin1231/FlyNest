import Passenger from "../models/Passenger.js";
import { isItCustomer, isItAdmin } from "./userController.js";
import { v4 as uuidv4 } from "uuid";

// Create Passenger – Customer Only
export async function createPassenger(req, res) {
  if (!isItCustomer(req))
    return res.status(403).json({ error: "Only customers can add passengers" });

  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const {
      firstname,
      lastname,
      email,
      phone,
      dateOfBirth,
      passportNumber: suppliedPassport,
      gender,
    } = req.body;

    if (
      !firstname ||
      !lastname ||
      !email ||
      !phone ||
      !dateOfBirth ||
      !gender
    ) {
      return res
        .status(400)
        .json({ error: "Missing required passenger fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const passportNumber = suppliedPassport
      ? suppliedPassport
      : `PP-${uuidv4().split("-")[0].toUpperCase()}`;

    const passenger = new Passenger({
      firstname,
      lastname,
      email,
      phone,
      dateOfBirth,
      passportNumber,
      gender,
      userId: req.user.userId,
    });

    await passenger.save();
    res.status(201).json(passenger);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.passportNumber) {
      return res.status(409).json({
        error: "Passport number already exists for another passenger",
      });
    }

    console.error("createPassenger error:", error);
    res
      .status(500)
      .json({ error: error.message || "Server error creating passenger" });
  }
}

// Get All Passengers for Logged-in Customer
export async function getMyPassengers(req, res) {
  if (!isItCustomer(req))
    return res.status(403).json({ error: "Access denied" });

  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const passengers = await Passenger.find({ userId: req.user.userId });
    res.status(200).json(passengers);
  } catch (error) {
    console.error("getMyPassengers error:", error);
    res.status(500).json({ error: error.message });
  }
}

// Get single passenger by ID – only own
export async function getPassengerById(req, res) {
  if (!isItCustomer(req))
    return res.status(403).json({ error: "Access denied" });

  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const passenger = await Passenger.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!passenger)
      return res.status(404).json({ error: "Passenger not found" });

    res.status(200).json(passenger);
  } catch (error) {
    console.error("getPassengerById error:", error);
    res.status(500).json({ error: error.message });
  }
}

// Update passenger – only own
export async function updatePassenger(req, res) {
  if (!isItCustomer(req))
    return res.status(403).json({ error: "Access denied" });

  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const updated = await Passenger.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Passenger not found" });

    res.status(200).json(updated);
  } catch (error) {
    console.error("updatePassenger error:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function deletePassenger(req, res) {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const isCustomer = isItCustomer(req);
  const isAdmin = isItAdmin(req);

  if (!isCustomer && !isAdmin) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const query = isAdmin
      ? { _id: req.params.id } // Admins can delete any passenger
      : { _id: req.params.id, userId: req.user.userId }; // Customers can delete only their own

    const deleted = await Passenger.findOneAndDelete(query);

    if (!deleted) return res.status(404).json({ error: "Passenger not found" });

    res.status(200).json({ message: "Passenger deleted successfully" });
  } catch (error) {
    console.error("deletePassenger error:", error);
    res.status(500).json({ error: error.message });
  }
}

// Admin: get all passengers
export async function getAllPassengers(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (!isItAdmin(req)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const passengers = await Passenger.find().sort({ createdAt: -1 });
    res.status(200).json(passengers);
  } catch (error) {
    console.error("getAllPassengers error:", error);
    res.status(500).json({ error: error.message });
  }
}
