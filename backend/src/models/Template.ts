import mongoose, { Schema, Document } from 'mongoose';
import { IQuestionTypeConfig } from '../types';

export interface ITemplate extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  subject: string;
  grade: string;
  duration?: string;
  questionTypes: IQuestionTypeConfig[];
  additionalInstructions?: string;
  createdAt: Date;
}

const QuestionTypeSubSchema = new Schema({
  type: { type: String, enum: ['mcq', 'short_answer', 'long_answer', 'true_false'], required: true },
  count: { type: Number, required: true, min: 1 },
  marksPerQuestion: { type: Number, required: true, min: 1 },
}, { _id: false });

const TemplateSchema = new Schema<ITemplate>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  grade: { type: String, required: true, trim: true },
  duration: { type: String },
  questionTypes: { type: [QuestionTypeSubSchema], required: true },
  additionalInstructions: { type: String, trim: true },
}, { timestamps: true });

export const Template = mongoose.model<ITemplate>('Template', TemplateSchema);
