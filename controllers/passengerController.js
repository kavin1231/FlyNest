// passengerController.js

import Passenger from "../models/Passenger.js";
import { isItCustomer } from "./userController.js";

// Create Passenger – Customer Only
export async function createPassenger(req, res) {
  if (!isItCustomer(req))
    return res.status(403).json({ error: "Only customers can add passengers" });

  try {
    const passenger = new Passenger({
      ...req.body,
      userId: req.user.id,
    });

    await passenger.save();
    res.status(201).json(passenger);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get All Passengers for Logged-in Customer
export async function getMyPassengers(req, res) {
  if (!isItCustomer(req))
    return res.status(403).json({ error: "Access denied" });

  try {
    const passengers = await Passenger.find({ userId: req.user.id });
    res.status(200).json(passengers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get Single Passenger by ID – Only Own
export async function getPassengerById(req, res) {
  if (!isItCustomer(req))
    return res.status(403).json({ error: "Access denied" });

  try {
    const passenger = await Passenger.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!passenger)
      return res.status(404).json({ error: "Passenger not found" });

    res.status(200).json(passenger);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update Passenger – Only Own
export async function updatePassenger(req, res) {
  if (!isItCustomer(req))
    return res.status(403).json({ error: "Access denied" });

  try {
    const updated = await Passenger.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ error: "Passenger not found" });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete Passenger – Only Own
export async function deletePassenger(req, res) {
  if (!isItCustomer(req))
    return res.status(403).json({ error: "Access denied" });

  try {
    const deleted = await Passenger.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted)
      return res.status(404).json({ error: "Passenger not found" });

    res.status(200).json({ message: "Passenger deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
