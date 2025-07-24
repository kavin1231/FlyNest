import express from "express";
import {
  createFlight,
  getAllFlights,
  getFlightById,
  updateFlight,
  deleteFlight,
} from "../controllers/flightController.js";

const flightRouter = express.Router();

flightRouter.post("/", createFlight);
flightRouter.get("/", getAllFlights);
flightRouter.get("/:id", getFlightById);
flightRouter.put("/:id", updateFlight);
flightRouter.delete("/:id", deleteFlight);

export default flightRouter;
