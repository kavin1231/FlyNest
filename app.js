import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";
import userRouter from "./routes/userRouter.js";
import flightRouter from "./routes/flightRouter.js";
import airportRouter from "./routes/airportRouter.js";
import bookingRouter from "./routes/bookingRouter.js";
import paymentRouter from "./routes/paymentRouter.js";
import contactRouter from "./routes/contactRouter.js";
import passengerRouter from "./routes/passengerRouter.js";

dotenv.config();
const app = express();
app.use(cors());

app.use(bodyParser.json());

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

app.use("/api/users", userRouter);
app.use("/api/flights", flightRouter);
app.use("/api/airports", airportRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/contacts", contactRouter);
app.use("/api/passengers", passengerRouter);

app.listen(3010, () => {
  console.log("Server is running on port 3010");
});
