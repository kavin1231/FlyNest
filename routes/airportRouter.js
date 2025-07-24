import express from "express";
import {
  createAirport,
  getAllAirports,
  getAirportById,
  updateAirport,
  deleteAirport,
} from "../controllers/airportController.js";

const airportRouter = express.Router();

airportRouter.get("/", getAllAirports);
airportRouter.get("/:id", getAirportById);
airportRouter.post("/", createAirport);
airportRouter.put("/:id", updateAirport);
airportRouter.delete("/:id", deleteAirport);

export default airportRouter;
