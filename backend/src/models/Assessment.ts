import mongoose, { Schema, Document } from 'mongoose';
import { ISection, IAssessmentMetadata } from '../types';

export interface IAssessment extends Document {
  assignmentId: mongoose.Types.ObjectId;
  title: string;
  generalInstructions: string;
  sections: ISection[];
  metadata: IAssessmentMetadata;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

const QuestionSchema = new Schema({
  number: { type: Number, required: true },
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  marks: { type: Number, required: true },
  type: { type: String, enum: ['mcq', 'short_answer', 'long_answer', 'true_false'], required: true },
}, { _id: false });

const SectionSchema = new Schema<ISection>({
  name: { type: String, required: true },
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: { type: [QuestionSchema], required: true },
}, { _id: false });

const MetadataSchema = new Schema<IAssessmentMetadata>({
  totalQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  timeEstimate: { type: String },
}, { _id: false });

const AssessmentSchema = new Schema<IAssessment>({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, unique: true },
  title: { type: String, required: true },
  generalInstructions: { type: String, required: true },
  sections: { type: [SectionSchema], required: true },
  metadata: { type: MetadataSchema, required: true },
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
}, { timestamps: true });

export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);
