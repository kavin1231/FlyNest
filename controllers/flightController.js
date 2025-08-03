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

// Get All Flights with Search Filtering – Public (FIXED)
export async function getAllFlights(req, res) {
  try {
    const { from, to, date } = req.query;
    
    console.log("Search parameters received:", { from, to, date });
    
    // Build query object
    let query = {};
    
    // Add search filters if provided - no need to convert to uppercase since DB already has uppercase
    if (from) {
      query.departure = from;
    }
    
    if (to) {
      query.arrival = to;
    }
    
    if (date) {
      // Parse the date properly - expecting YYYY-MM-DD format from frontend
      const searchDate = new Date(date);
      
      // Create date range for the entire day in UTC
      const startOfDay = new Date(date + 'T00:00:00.000Z');
      const endOfDay = new Date(date + 'T23:59:59.999Z');
      
      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
      
      console.log("Date filter:", {
        inputDate: date,
        searchDate: searchDate.toISOString(),
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString()
      });
    }
    
    // Only show scheduled flights with available seats
    query.status = "scheduled";
    query.availableSeats = { $gt: 0 };
    
    console.log("Final query:", JSON.stringify(query, null, 2));
    
    // First, let's see what dates we actually have in the database
    const allFlights = await Flight.find({ status: "scheduled" });
    console.log("All scheduled flights details:", allFlights.map(f => ({ 
      flightNumber: f.flightNumber, 
      departure: f.departure, 
      arrival: f.arrival, 
      date: f.date?.toISOString(),
      availableSeats: f.availableSeats,
      status: f.status
    })));
    
    // Let's also test without date filter first
    if (from && to) {
      const flightsWithoutDate = await Flight.find({
        departure: from,
        arrival: to,
        status: "scheduled",
        availableSeats: { $gt: 0 }
      });
      console.log(`Flights matching route (${from} → ${to}) without date filter:`, flightsWithoutDate.length);
      console.log("Route matches:", flightsWithoutDate.map(f => ({ 
        flightNumber: f.flightNumber, 
        date: f.date?.toISOString() 
      })));
    }
    
    const flights = await Flight.find(query).sort({ 
      date: 1,           // Sort by date first
      departureTime: 1   // Then by departure time
    });
    
    console.log(`Found ${flights.length} flights matching full criteria`);
    console.log("Matching flights:", flights.map(f => ({ 
      flightNumber: f.flightNumber, 
      departure: f.departure, 
      arrival: f.arrival, 
      date: f.date?.toISOString() 
    })));
    
    // Filter out flights with invalid data
    const validFlights = flights.filter(f => f.departure && f.arrival && f.date);
    
    console.log(`Returning ${validFlights.length} valid flights`);
    
    res.status(200).json(validFlights);
  } catch (error) {
    console.error("Error fetching flights:", error);
    res.status(500).json({ error: error.message });
  }
}

// Get All Flights for Customers – Public, No Filters
export async function getAllFlightsCustomer(req, res) {
  try {
    console.log("Fetching all flights for customer view...");
    
    // Get all scheduled flights with available seats, sorted by departure time
    const flights = await Flight.find({
      status: "scheduled",
      availableSeats: { $gt: 0 }
    }).sort({ 
      date: 1,           // Sort by date first
      departureTime: 1   // Then by departure time
    });
    
    // Filter out flights with invalid data
    const validFlights = flights.filter(f => 
      f.departure && 
      f.arrival && 
      f.date && 
      f.departureTime && 
      f.arrivalTime &&
      f.price
    );
    
    console.log(`Found ${validFlights.length} valid flights for customers`);
    res.status(200).json(validFlights);
  } catch (error) {
    console.error("Error fetching customer flights:", error);
    res.status(500).json({ error: error.message });
  }
}

// Get All Flights without filtering (for admin purposes)
export async function getAllFlightsAdmin(req, res) {
  if (!isItAdmin(req)) {
    return res.status(403).json({ error: "Only admins can view all flights" });
  }

  try {
    const flights = await Flight.find().sort({ 
      date: 1,           // Sort by date first
      departureTime: 1   // Then by departure time
    });
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
    // Convert departure and arrival to uppercase if they exist in the update
    const updateData = { ...req.body };
    if (updateData.departure) {
      updateData.departure = updateData.departure.toUpperCase();
    }
    if (updateData.arrival) {
      updateData.arrival = updateData.arrival.toUpperCase();
    }

    const updatedFlight = await Flight.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
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