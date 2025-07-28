import express from "express";
import {
  createFlight,
  getAllFlights,
  getAllFlightsAdmin,
  getFlightById,
  updateFlight,
  deleteFlight,
} from "../controllers/flightController.js";

const flightRouter = express.Router();

flightRouter.post("/", createFlight);
flightRouter.get("/", getAllFlights);  // This now supports search filtering
flightRouter.get("/admin/all", getAllFlightsAdmin);  // Admin route for all flights
flightRouter.get("/:id", getFlightById);
flightRouter.put("/:id", updateFlight);
flightRouter.delete("/:id", deleteFlight);

export default flightRouter;