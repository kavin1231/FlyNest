import express from "express";
import {
  createPassenger,
  getMyPassengers,
  getPassengerById,
  updatePassenger,
  deletePassenger,
} from "../controllers/passengerController.js";

const passengerRouter = express.Router();

passengerRouter.post("/", createPassenger);
passengerRouter.get("/", getMyPassengers);
passengerRouter.get("/:id", getPassengerById);
passengerRouter.put("/:id", updatePassenger);
passengerRouter.delete("/:id", deletePassenger);

export default passengerRouter;
