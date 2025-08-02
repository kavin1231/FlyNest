import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved', 'closed'],
      default: 'pending'
    },
    category: {
      type: String,
      enum: ['general', 'booking', 'payment', 'flight', 'complaint', 'suggestion', 'technical'],
      default: 'general'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false 
    },
    adminResponse: {
      type: String,
      default: ''
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


contactSchema.virtual('hasResponse').get(function() {
  return !!this.adminResponse;
});


contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ userId: 1 });
contactSchema.index({ priority: 1, status: 1 });

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;