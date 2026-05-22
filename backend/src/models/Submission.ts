import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
  questionNumber: number;
  text: string;
  marksAwarded?: number;
  isCorrect?: boolean;
}

export interface ISubmission extends Document {
  assessmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  totalMarksAwarded: number;
  totalMarks: number;
  percentage: number;
  status: 'graded' | 'pending' | 'partial';
  submittedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  questionNumber: { type: Number, required: true },
  text: { type: String, required: true },
  marksAwarded: { type: Number },
  isCorrect: { type: Boolean },
}, { _id: false });

const SubmissionSchema = new Schema<ISubmission>({
  assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  answers: { type: [AnswerSchema], required: true },
  totalMarksAwarded: { type: Number, default: 0 },
  totalMarks: { type: Number, required: true },
  percentage: { type: Number, default: 0 },
  status: { type: String, enum: ['graded', 'pending', 'partial'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

SubmissionSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
