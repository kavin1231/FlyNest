import express from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
} from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post("/", createPayment);
paymentRouter.get("/", getAllPayments);
paymentRouter.get("/:id", getPaymentById);
paymentRouter.put("/:id", updatePayment);
paymentRouter.delete("/:id", deletePayment);

export default paymentRouter;
