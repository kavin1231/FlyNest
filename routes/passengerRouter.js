import express from "express";
import {
  createPassenger,
  getMyPassengers,
  getPassengerById,
  updatePassenger,
  deletePassenger,
  getAllPassengers,
} from "../controllers/passengerController.js";

const passengerRouter = express.Router();

passengerRouter.post("/", createPassenger);
passengerRouter.get("/", getMyPassengers); // customer-specific
passengerRouter.get("/all", getAllPassengers); // admin listing
passengerRouter.get("/:id", getPassengerById);
passengerRouter.put("/:id", updatePassenger);
passengerRouter.delete("/:id", deletePassenger);

export default passengerRouter;
