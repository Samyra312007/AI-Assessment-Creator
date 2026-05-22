import mongoose, { Schema, Document } from 'mongoose';
import { JobStatus } from '../types';

export interface IJob extends Document {
  jobId: string;
  assignmentId: mongoose.Types.ObjectId;
  type: 'generation' | 'pdf_export';
  status: JobStatus;
  progress: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>({
  jobId: { type: String, required: true, unique: true },
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
  type: { type: String, enum: ['generation', 'pdf_export'], required: true },
  status: { type: String, enum: ['queued', 'active', 'completed', 'failed', 'delayed'], default: 'queued' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  error: { type: String },
}, { timestamps: true });

export const Job = mongoose.model<IJob>('Job', JobSchema);
