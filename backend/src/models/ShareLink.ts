import mongoose, { Schema, Document } from 'mongoose';

export interface IShareLink extends Document {
  assessmentId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  code: string;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

const ShareLinkSchema = new Schema<IShareLink>({
  assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
}, { timestamps: true });

ShareLinkSchema.index({ code: 1 });

export const ShareLink = mongoose.model<IShareLink>('ShareLink', ShareLinkSchema);
