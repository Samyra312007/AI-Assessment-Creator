import mongoose, { Schema, Document } from 'mongoose';
import { AssignmentStatus, IQuestionTypeConfig } from '../types';

export interface IAssignment extends Document {
  title: string;
  subject: string;
  grade: string;
  dueDate: Date;
  questionTypes: IQuestionTypeConfig[];
  fileUrl?: string;
  additionalInstructions?: string;
  status: AssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeSchema = new Schema<IQuestionTypeConfig>({
  type: { type: String, enum: ['mcq', 'short_answer', 'long_answer', 'true_false'], required: true },
  count: { type: Number, required: true, min: 1 },
  marksPerQuestion: { type: Number, required: true, min: 1 },
}, { _id: false });

const AssignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  grade: { type: String, required: true, trim: true },
  dueDate: { type: Date, required: true },
  questionTypes: { type: [QuestionTypeSchema], required: true, validate: [(arr: IQuestionTypeConfig[]) => arr.length > 0, 'At least one question type required'] },
  fileUrl: { type: String },
  additionalInstructions: { type: String, trim: true },
  status: {
    type: String,
    enum: ['draft', 'queued', 'processing', 'completed', 'failed'],
    default: 'draft',
  },
}, { timestamps: true });

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
