import mongoose, { Schema, Document } from 'mongoose';
import { QuestionType, Difficulty } from '../types';

export interface IQuestionBank extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  grade: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  tags: string[];
  createdAt: Date;
}

const QuestionBankSchema = new Schema<IQuestionBank>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, trim: true },
  grade: { type: String, required: true, trim: true },
  text: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'short_answer', 'long_answer', 'true_false'], required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  marks: { type: Number, required: true, min: 1 },
  tags: [{ type: String, trim: true }],
}, { timestamps: true });

QuestionBankSchema.index({ userId: 1, subject: 1 });
QuestionBankSchema.index({ userId: 1, type: 1 });

export const QuestionBank = mongoose.model<IQuestionBank>('QuestionBank', QuestionBankSchema);
