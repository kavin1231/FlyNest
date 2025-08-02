import Contact from "../models/Contact.js";
import { isItAdmin, isItCustomer } from "./userController.js";

// Create a new contact/inquiry – Customer Only (or anonymous)
export async function createContact(req, res) {
  try {
    const contactData = {
      ...req.body,
      userId: req.user?.id || null, // Allow anonymous contacts
    };
    
    const contact = new Contact(contactData);
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get all inquiries – Admin Only
export async function getAllContacts(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Only admins can view contacts" });

  try {
    const contacts = await Contact.find()
      .populate("userId", "name email")
      .populate("respondedBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get user's own contacts – Customer Only
export async function getUserContacts(req, res) {
  if (!isItCustomer(req)) return res.status(403).json({ error: "Only customers can view their contacts" });

  try {
    const contacts = await Contact.find({ userId: req.user.id })
      .populate("respondedBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get a specific inquiry – Admin Only
export async function getContactById(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Only admins can view this contact" });

  try {
    const contact = await Contact.findById(req.params.id)
      .populate("userId", "name email")
      .populate("respondedBy", "name email");
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update contact status – Admin Only
export async function updateContactStatus(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Only admins can update contact status" });

  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Mark contact as read – Admin Only
export async function markContactAsRead(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Only admins can mark contacts as read" });

  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Respond to contact – Admin Only
export async function respondToContact(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Only admins can respond to contacts" });

  try {
    const { response } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { 
        adminResponse: response,
        respondedBy: req.user.id,
        respondedAt: new Date(),
        status: 'resolved',
        isRead: true
      },
      { new: true }
    ).populate("respondedBy", "name email");
    
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete an inquiry – Admin Only
export async function deleteContact(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Only admins can delete contacts" });

  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get contact statistics – Admin Only
export async function getContactStats(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Only admins can view contact statistics" });

  try {
    const totalContacts = await Contact.countDocuments();
    const pendingContacts = await Contact.countDocuments({ status: 'pending' });
    const unresolvedContacts = await Contact.countDocuments({ 
      status: { $in: ['pending', 'in-progress'] } 
    });
    const respondedContacts = await Contact.countDocuments({ 
      adminResponse: { $exists: true, $ne: '' } 
    });

    // Priority breakdown
    const priorityStats = await Contact.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      }
    ]);

    // Category breakdown
    const categoryStats = await Contact.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent contacts trend (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentContacts = await Contact.aggregate([
      {
        $match: {
          createdAt: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    res.status(200).json({
      total: totalContacts,
      pending: pendingContacts,
      unresolved: unresolvedContacts,
      responded: respondedContacts,
      responseRate: totalContacts > 0 ? (respondedContacts / totalContacts * 100).toFixed(1) : 0,
      priorityBreakdown: priorityStats,
      categoryBreakdown: categoryStats,
      recentTrend: recentContacts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}