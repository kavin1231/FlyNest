import Airport from "../models/Airport.js";
import { isItAdmin } from "./userController.js";

// Create Airport – Admin Only
export async function createAirport(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Only admins can create airports" });

  try {
    const airport = new Airport(req.body);
    await airport.save();
    res.status(201).json(airport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get All Airports – Public
export async function getAllAirports(req, res) {
  try {
    const airports = await Airport.find();
    res.status(200).json(airports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get Airport by ID – Public
export async function getAirportById(req, res) {
  try {
    const airport = await Airport.findById(req.params.id);
    if (!airport) return res.status(404).json({ error: "Airport not found" });

    res.status(200).json(airport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update Airport – Admin Only
export async function updateAirport(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Only admins can update airports" });

  try {
    const updated = await Airport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Airport not found" });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete Airport – Admin Only
export async function deleteAirport(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Only admins can delete airports" });

  try {
    await Airport.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Airport deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
