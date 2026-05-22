import mongoose, { Schema, Document } from 'mongoose';
import { ISection, IAssessmentMetadata } from '../types';

export interface IAssessmentVersion extends Document {
  assessmentId: mongoose.Types.ObjectId;
  version: number;
  title: string;
  generalInstructions: string;
  sections: ISection[];
  metadata: IAssessmentMetadata;
  createdAt: Date;
}

const AssessmentVersionSchema = new Schema<IAssessmentVersion>({
  assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
  version: { type: Number, required: true },
  title: { type: String, required: true },
  generalInstructions: { type: String, required: true },
  sections: { type: Schema.Types.Mixed, required: true },
  metadata: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

AssessmentVersionSchema.index({ assessmentId: 1, version: -1 });

export const AssessmentVersion = mongoose.model<IAssessmentVersion>('AssessmentVersion', AssessmentVersionSchema);
