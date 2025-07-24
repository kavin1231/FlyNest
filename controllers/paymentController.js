import Payment from "../models/Payment.js";
import { isItAdmin, isItCustomer } from "./userController.js";

// Create a new payment (Customer only)
export async function createPayment(req, res) {
  if (!isItCustomer(req)) {
    return res.status(403).json({ error: "Only customers can make payments" });
  }

  try {
    const payment = new Payment({
      ...req.body,
      userId: req.user.id,
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get all payments (Admin only)
export async function getAllPayments(req, res) {
  if (!isItAdmin(req)) {
    return res.status(403).json({ error: "Only admins can view payments" });
  }

  try {
    const payments = await Payment.find().populate(
      "userId",
      "firstname lastname email"
    );
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get payment by ID (Admin only)
export async function getPaymentById(req, res) {
  if (!isItAdmin(req)) {
    return res.status(403).json({ error: "Only admins can view this payment" });
  }

  try {
    const payment = await Payment.findById(req.params.id).populate(
      "userId",
      "firstname lastname email"
    );
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update payment (Admin only)
export async function updatePayment(req, res) {
  if (!isItAdmin(req)) {
    return res.status(403).json({ error: "Only admins can update payments" });
  }

  try {
    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Payment not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete payment (Admin only)
export async function deletePayment(req, res) {
  if (!isItAdmin(req)) {
    return res.status(403).json({ error: "Only admins can delete payments" });
  }

  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
