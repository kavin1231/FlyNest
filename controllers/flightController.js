import Flight from "../models/Flight.js";
import { isItAdmin } from "./userController.js";

// Create Flight – Admins Only
export async function createFlight(req, res) {
  if (!isItAdmin(req)) {
    return res.status(403).json({ error: "Only admins can create flights" });
  }

  try {
    const {
      flightNumber,
      airline,
      departure,
      arrival,
      departureTime,
      arrivalTime,
      date,
      totalSeats,
      availableSeats,
      price,
      image,
      status,
    } = req.body;

    // Basic required field check
    if (
      !flightNumber ||
      !departure ||
      !arrival ||
      !departureTime ||
      !arrivalTime ||
      !date ||
      !totalSeats ||
      !availableSeats ||
      !price
    ) {
      return res.status(400).json({ error: "Missing required flight details" });
    }

    const newFlight = new Flight({
      flightNumber,
      airline,
      departure: departure.toUpperCase(),
      arrival: arrival.toUpperCase(), 
      departureTime,
      arrivalTime,
      date,
      totalSeats,
      availableSeats,
      price,
      image,
      status,
    });

    const savedFlight = await newFlight.save();
    res.status(201).json(savedFlight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get All Flights with Search Filtering – Public
export async function getAllFlights(req, res) {
  try {
    const { from, to, date } = req.query;
    
    // Build query object
    let query = {};
    
    // Add search filters if provided
    if (from) {
      query.departure = from.toUpperCase();
    }
    
    if (to) {
      query.arrival = to.toUpperCase();
    }
    
    if (date) {
      // Parse the date and create a range for the entire day
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }
    
    // Only show scheduled flights with available seats
    query.status = "scheduled";
    query.availableSeats = { $gt: 0 };
    
    const flights = await Flight.find(query).sort({ departureTime: 1 });
    
    // Filter out flights with invalid data
    const validFlights = flights.filter(f => f.departure && f.arrival && f.date);
    
    res.status(200).json(validFlights);
  } catch (error) {
    console.error("Error fetching flights:", error);
    res.status(500).json({ error: error.message });
  }
}

// Get All Flights without filtering (for admin purposes)
export async function getAllFlightsAdmin(req, res) {
  if (!isItAdmin(req)) {
    return res.status(403).json({ error: "Only admins can view all flights" });
  }

  try {
    const flights = await Flight.find();
    res.status(200).json(flights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get Flight by ID – Public
export async function getFlightById(req, res) {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ error: "Flight not found" });
    }
    res.status(200).json(flight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update Flight – Admins Only
export async function updateFlight(req, res) {
  if (!isItAdmin(req)) {
    return res.status(403).json({ error: "Only admins can update flights" });
  }

  try {
    const updatedFlight = await Flight.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedFlight) {
      return res.status(404).json({ error: "Flight not found" });
    }
    res.status(200).json(updatedFlight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete Flight – Admins Only
export async function deleteFlight(req, res) {
  if (!isItAdmin(req)) {
    return res.status(403).json({ error: "Only admins can delete flights" });
  }

  try {
    const deleted = await Flight.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Flight not found" });
    }
    res.status(200).json({ message: "Flight deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}