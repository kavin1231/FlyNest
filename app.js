import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken"; // This was missing!
import bodyParser from "body-parser";

// Import route files
import userRouter from "./routes/userRouter.js";
import flightRouter from "./routes/flightRouter.js";
import bookingRouter from "./routes/bookingRouter.js";
import passengerRouter from "./routes/passengerRouter.js";
import paymentRouter from "./routes/paymentRouter.js";
import contactRouter from "./routes/contactRouter.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// JWT middleware - fixed with proper jwt import
app.use((req, res, next) => {
  let token = req.header("Authorization");
  if (token != null) {
    token = token.replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.user = decoded;
      }
    });
  }
  next();
});

let mongoUrl = process.env.MONGO_URL;

mongoose.connect(mongoUrl);

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB connection established successfully");
});

// Public routes (no auth required)
app.use("/api/users", userRouter); // Login/Register routes

// Protected routes (auth required)
app.use("/api/flights", flightRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/passengers", passengerRouter);
app.use("/api", paymentRouter);
app.use("/api/contacts", contactRouter); // This handles /api/create-payment-intent and /api/payments/*

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
