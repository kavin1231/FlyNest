import express from 'express';
import {
  createFlight,
  getAllFlights,
  getAllFlightsAdmin,
  getAllFlightsCustomer, // NEW: Import the customer function
  getFlightById,
  updateFlight,
  deleteFlight
} from '../controllers/flightController.js';

const flightRouter = express.Router();

// Admin routes (must come first before parameterized routes!)
flightRouter.get('/admin/all', getAllFlightsAdmin);    // GET /api/flights/admin/all

// Customer routes (specific paths before parameterized routes)
flightRouter.get('/customer/all', getAllFlightsCustomer); // NEW: GET /api/flights/customer/all

// Public routes
flightRouter.get('/', getAllFlights);                  // GET /api/flights (with search filtering)
flightRouter.get('/:id', getFlightById);               // GET /api/flights/:id

// Admin-only routes
flightRouter.post('/', createFlight);                  // POST /api/flights
flightRouter.put('/:id', updateFlight);                // PUT /api/flights/:id  
flightRouter.delete('/:id', deleteFlight);             // DELETE /api/flights/:id

export default flightRouter;