import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    userEmail: { type: String, required: true },
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: "Flight", required: true },
    flightDetails: {
      flightNumber: { type: String, required: true },
      departure: { type: String, required: true },
      arrival: { type: String, required: true },
      date: { type: Date, required: true },
      pricePerSeat: { type: Number, required: true },
      image: String,
    },
    passengers: [
      {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        passportNumber: String,
      },
    ],
    seatsBooked: { type: Number, required: true },
    totalAmount: { type: Number, required: true, default: 0 },
    bookingDate: { type: Date, default: Date.now },
    paymentId: { type: String },
    status: {
      type: String,
      enum: ["preparing", "confirmed", "cancelled"],
      default: "preparing",
    },
    notes: { type: String },
    customerName: { type: String, required: true },
    customerAddress: { type: String, required: true },
    customerPhone: { type: String, required: true },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
