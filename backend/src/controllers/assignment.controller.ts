import { Response } from 'express';
import { Assignment } from '../models/Assignment';
import { Assessment } from '../models/Assessment';
import { AssessmentVersion } from '../models/AssessmentVersion';
import { Job } from '../models/Job';
import { QuestionBank } from '../models/QuestionBank';
import { generationQueue } from '../queues';
import { generateAssessmentPdf } from '../services/pdf.service';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

export async function createAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const assignment = new Assignment({
      ...data,
      userId: req.user?.userId,
      dueDate: new Date(data.dueDate),
      fileUrl,
      status: 'queued',
    });

    await assignment.save();

    const jobId = uuidv4();
    const job = new Job({
      jobId, assignmentId: assignment._id, type: 'generation', status: 'queued', progress: 0,
    });
    await job.save();
    await generationQueue.add('generate', { assignmentId: assignment._id.toString() }, { jobId });

    res.status(201).json({ assignmentId: assignment._id, jobId, status: 'queued' });
  } catch (error: any) {
    logger.error('Create assignment error:', error);
    res.status(500).json({ error: error.message || 'Failed to create assignment' });
  }
}

export async function getAssignments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const filter: any = {};
    if (req.user?.role !== 'admin') filter.userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const [assignments, total] = await Promise.all([
      Assignment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Assignment.countDocuments(filter),
    ]);
    res.json({ data: assignments, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) { res.status(404).json({ error: 'Assignment not found' }); return; }
    res.json(assignment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) { res.status(404).json({ error: 'Assignment not found' }); return; }
    await Assessment.findOneAndDelete({ assignmentId: req.params.id });
    res.json({ message: 'Assignment deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAssessmentByAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assessment = await Assessment.findOne({ assignmentId: req.params.id }).lean();
    if (!assessment) { res.status(404).json({ error: 'Assessment not found' }); return; }
    res.json(assessment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function regenerateAssessment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) { res.status(404).json({ error: 'Assignment not found' }); return; }

    assignment.status = 'queued';
    await assignment.save();

    const existing = await Assessment.findOne({ assignmentId: assignment._id });
    if (existing) {
      const latestVersion = await AssessmentVersion.findOne({ assessmentId: existing._id }).sort({ version: -1 });
      await new AssessmentVersion({
        assessmentId: existing._id,
        version: (latestVersion?.version || 0) + 1,
        title: existing.title,
        generalInstructions: existing.generalInstructions,
        sections: existing.sections,
        metadata: existing.metadata,
      }).save();
      await Assessment.findOneAndDelete({ assignmentId: assignment._id });
    }

    const jobId = uuidv4();
    const job = new Job({ jobId, assignmentId: assignment._id, type: 'generation', status: 'queued', progress: 0 });
    await job.save();
    await generationQueue.add('generate', { assignmentId: assignment._id.toString() }, { jobId });

    res.json({ assignmentId: assignment._id, jobId, status: 'queued' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function downloadPdf(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) { res.status(404).json({ error: 'Assessment not found' }); return; }

    const pdfBuffer = await generateAssessmentPdf(assessment);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${assessment.title.replace(/\s+/g, '_')}_Question_Paper.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    logger.error('PDF download error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate PDF' });
  }
}
