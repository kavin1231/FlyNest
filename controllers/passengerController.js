// passengerController.js

import Passenger from "../models/Passenger.js";
import { isItCustomer } from "./userController.js";
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

    // Basic required validation (schema will also enforce)
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

    // Ensure email looks valid (optional, schema also enforces)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // If passportNumber not provided, generate one to satisfy schema requirement
    const passportNumber = suppliedPassport
      ? suppliedPassport
      : `PP-${uuidv4().split("-")[0].toUpperCase()}`;

    const passenger = new Passenger({
      firstname,
      lastname,
      email,
      phone,
      dateOfBirth,
      // age will be auto-computed in pre-validate hook if missing
      passportNumber,
      gender,
      userId: req.user.userId,
    });

    await passenger.save();
    res.status(201).json(passenger);
  } catch (error) {
    // Duplicate passport number
    if (error.code === 11000 && error.keyPattern?.passportNumber) {
      return res
        .status(409)
        .json({
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

// Get Single Passenger by ID – Only Own
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

// Update Passenger – Only Own
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

// Delete Passenger – Only Own
export async function deletePassenger(req, res) {
  if (!isItCustomer(req))
    return res.status(403).json({ error: "Access denied" });

  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const deleted = await Passenger.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!deleted) return res.status(404).json({ error: "Passenger not found" });

    res.status(200).json({ message: "Passenger deleted successfully" });
  } catch (error) {
    console.error("deletePassenger error:", error);
    res.status(500).json({ error: error.message });
  }
}
