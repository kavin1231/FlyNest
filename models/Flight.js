import mongoose from "mongoose";

const flightSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: true,
    },
    departure: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    airline: {
      type: String,
      default: "Default Airline",
    },
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "delayed"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

const Flight = mongoose.model("Flight", flightSchema);
export default Flight;
