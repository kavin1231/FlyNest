import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    passportNumber: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
  },
  { timestamps: true }
);

const Passenger = mongoose.model("Passenger", passengerSchema);
export default Passenger;
