import express from "express";
import {
  createPaymentIntent,
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
} from "../controllers/paymentController.js";

const paymentRouter = express.Router();

// Payment Intent route (for Stripe) - this should be accessible at /api/create-payment-intent
paymentRouter.post("/create-payment-intent", createPaymentIntent);

// Payment CRUD routes - these should be accessible at /api/payments/*
paymentRouter.post("/payments", createPayment);
paymentRouter.get("/payments", getAllPayments);
paymentRouter.get("/payments/:id", getPaymentById);
paymentRouter.put("/payments/:id", updatePayment);
paymentRouter.delete("/payments/:id", deletePayment);

export default paymentRouter;