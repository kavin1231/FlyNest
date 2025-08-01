import Payment from "../models/Payment.js";
import { isItAdmin, isItCustomer } from "./userController.js";
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent (Customer only)
export async function createPaymentIntent(req, res) {
  try {
    console.log('Creating payment intent - User:', req.user);
    
    // Check if user is authenticated
    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user is customer (simplified check - adjust based on your user model)
    if (!isItCustomer(req)) {
      console.log('User is not a customer');
      return res.status(403).json({ error: "Only customers can create payment intents" });
    }

    const { amount, currency = "usd", metadata = {} } = req.body;
    console.log('Payment intent request:', { amount, currency, metadata });

    // Validate amount
    if (!amount || amount <= 0 || isNaN(amount)) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        userId: req.user.id || req.user._id,
        userEmail: req.user.email,
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Payment intent created successfully:', paymentIntent.id);

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: error.message || "Failed to create payment intent" 
    });
  }
}

// Create a new payment record (Customer only)
export async function createPayment(req, res) {
  try {
    console.log('Creating payment record - User:', req.user);
    
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!isItCustomer(req)) {
      return res.status(403).json({ error: "Only customers can make payments" });
    }

    const { bookingId, paymentIntentId, amount, method } = req.body;
    console.log('Payment creation request:', { bookingId, paymentIntentId, amount, method });

    if (!bookingId || !paymentIntentId || !amount || !method) {
      return res.status(400).json({ error: "Missing required payment information" });
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('Retrieved payment intent status:', paymentIntent.status);
    
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    if (paymentIntent.amount !== Math.round(amount * 100)) {
      console.log('Amount mismatch:', paymentIntent.amount, 'vs', Math.round(amount * 100));
      return res.status(400).json({ error: "Amount mismatch" });
    }

    // Create payment record
    const payment = new Payment({
      amount,
      method,
      status: "completed",
      booking: bookingId,
    });

    await payment.save();
    console.log('Payment record created:', payment._id);
    
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get all payments (Admin only)
export async function getAllPayments(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!isItAdmin(req)) {
      return res.status(403).json({ error: "Only admins can view payments" });
    }

    const payments = await Payment.find()
      .populate("booking")
      .sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error getting payments:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get payment by ID (Admin only)
export async function getPaymentById(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!isItAdmin(req)) {
      return res.status(403).json({ error: "Only admins can view this payment" });
    }

    const payment = await Payment.findById(req.params.id).populate("booking");
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.status(200).json(payment);
  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({ error: error.message });
  }
}

// Update payment (Admin only)
export async function updatePayment(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!isItAdmin(req)) {
      return res.status(403).json({ error: "Only admins can update payments" });
    }

    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Payment not found" });
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: error.message });
  }
}

// Delete payment (Admin only)
export async function deletePayment(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!isItAdmin(req)) {
      return res.status(403).json({ error: "Only admins can delete payments" });
    }

    await Payment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: error.message });
  }
}