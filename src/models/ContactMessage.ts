import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
  user: mongoose.Types.ObjectId | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  senderIp?: string;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      maxlength: [255, 'Email cannot exceed 255 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    senderIp: {
      type: String,
      default: '',
    },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ isRead: 1 });
contactMessageSchema.index({ user: 1 });
contactMessageSchema.index({ email: 1 });
contactMessageSchema.index({ conversationId: 1, createdAt: -1 });

contactMessageSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    delete ret.senderIp;
    return ret;
  },
});

const ContactMessage =
  mongoose.models.ContactMessage ||
  mongoose.model<IContactMessage>('ContactMessage', contactMessageSchema);

export default ContactMessage;