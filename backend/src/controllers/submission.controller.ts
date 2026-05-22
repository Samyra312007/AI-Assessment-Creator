import { Response } from 'express';
import { Assessment } from '../models/Assessment';
import { Submission } from '../models/Submission';
import { AuthRequest } from '../middleware/auth';

export async function submitAnswers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { assessmentId, answers } = req.body;
    const existing = await Submission.findOne({ assessmentId, studentId: req.user!.userId });
    if (existing) {
      res.status(409).json({ error: 'Already submitted' });
      return;
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) { res.status(404).json({ error: 'Assessment not found' }); return; }

    const totalMarks = assessment.metadata.totalMarks;
    let totalMarksAwarded = 0;
    let autoGraded = 0;

    const gradedAnswers = answers.map((ans: any) => {
      const question = assessment.sections
        .flatMap(s => s.questions)
        .find(q => q.number === ans.questionNumber);

      if (!question) return { ...ans, marksAwarded: 0 };

      if (question.type === 'mcq' || question.type === 'true_false') {
        const isCorrect = String(ans.text).trim().toLowerCase() === getCorrectAnswer(question.text);
        const marksAwarded = isCorrect ? question.marks : 0;
        if (isCorrect) autoGraded++;
        return { ...ans, marksAwarded, isCorrect };
      }

      return { ...ans, marksAwarded: 0 };
    });

    totalMarksAwarded = gradedAnswers.reduce((sum: number, a: any) => sum + (a.marksAwarded || 0), 0);
    const mcqCount = assessment.sections.flatMap(s => s.questions).filter(q => q.type === 'mcq' || q.type === 'true_false').length;
    const status = autoGraded === mcqCount && mcqCount === answers.length ? 'graded' : 'partial';

    const submission = new Submission({
      assessmentId,
      studentId: req.user!.userId,
      answers: gradedAnswers,
      totalMarksAwarded,
      totalMarks,
      percentage: totalMarks > 0 ? Math.round((totalMarksAwarded / totalMarks) * 100) : 0,
      status,
    });
    await submission.save();

    res.status(201).json(submission);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getMySubmissions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const submissions = await Submission.find({ studentId: req.user!.userId })
      .populate('assessmentId').sort({ submittedAt: -1 }).lean();
    res.json(submissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getSubmissionsForAssessment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const submissions = await Submission.find({ assessmentId: req.params.id })
      .populate('studentId', 'name email').sort({ percentage: -1 }).lean();
    res.json(submissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

function getCorrectAnswer(questionText: string): string {
  const mcqMatch = questionText.match(/\[Correct:\s*([^\]]+)\]/i);
  if (mcqMatch) return mcqMatch[1].trim().toLowerCase();
  return '';
}
