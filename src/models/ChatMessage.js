import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderAvatar: String,
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },

    // ✅ UPDATED attachment field
    attachment: {
      url: String,
      format: String,            // e.g., 'jpg', 'pdf', 'docx'
      original_filename: String, // e.g., 'invoice.pdf'
      resource_type: String      // 'image', 'raw', etc.
    },

    replyTo: {
      messageId: mongoose.Schema.Types.ObjectId,
      text: String,
      senderName: String,
    },

    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);
export default ChatMessage;
