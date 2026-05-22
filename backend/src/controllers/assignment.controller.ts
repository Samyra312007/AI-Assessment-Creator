import { Request, Response } from 'express';
import { Assignment } from '../models/Assignment';
import { Assessment } from '../models/Assessment';
import { Job } from '../models/Job';
import { generationQueue } from '../queues';
import { generateAssessmentPdf } from '../services/pdf.service';
import { v4 as uuidv4 } from 'uuid';

export async function createAssignment(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const assignment = new Assignment({
      ...data,
      dueDate: new Date(data.dueDate),
      fileUrl,
      status: 'queued',
    });

    await assignment.save();

    const jobId = uuidv4();
    const job = new Job({
      jobId,
      assignmentId: assignment._id,
      type: 'generation',
      status: 'queued',
      progress: 0,
    });
    await job.save();

    await generationQueue.add('generate', {
      assignmentId: assignment._id.toString(),
    }, { jobId });

    res.status(201).json({
      assignmentId: assignment._id,
      jobId,
      status: 'queued',
    });
  } catch (error: any) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: error.message || 'Failed to create assignment' });
  }
}

export async function getAssignments(_req: Request, res: Response): Promise<void> {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 }).lean();
    res.json(assignments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAssignment(req: Request, res: Response): Promise<void> {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }
    res.json(assignment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteAssignment(req: Request, res: Response): Promise<void> {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }
    await Assessment.findOneAndDelete({ assignmentId: req.params.id });
    res.json({ message: 'Assignment deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAssessmentByAssignment(req: Request, res: Response): Promise<void> {
  try {
    const assessment = await Assessment.findOne({ assignmentId: req.params.id }).lean();
    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }
    res.json(assessment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function regenerateAssessment(req: Request, res: Response): Promise<void> {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    assignment.status = 'queued';
    await assignment.save();

    await Assessment.findOneAndDelete({ assignmentId: assignment._id });

    const jobId = uuidv4();
    const job = new Job({
      jobId,
      assignmentId: assignment._id,
      type: 'generation',
      status: 'queued',
      progress: 0,
    });
    await job.save();

    await generationQueue.add('generate', {
      assignmentId: assignment._id.toString(),
    }, { jobId });

    res.json({ assignmentId: assignment._id, jobId, status: 'queued' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function downloadPdf(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findById(id);
    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }

    const pdfBuffer = await generateAssessmentPdf(assessment);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${assessment.title.replace(/\s+/g, '_')}_Question_Paper.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('PDF download error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate PDF' });
  }
}
