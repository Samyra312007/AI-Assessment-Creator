import { Response } from 'express';
import { QuestionBank } from '../models/QuestionBank';
import { AuthRequest } from '../middleware/auth';

export async function saveQuestion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const question = new QuestionBank({ ...req.body, userId: req.user!.userId });
    await question.save();
    res.status(201).json(question);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getQuestions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const filter: any = { userId: req.user!.userId };
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    const questions = await QuestionBank.find(filter).sort({ createdAt: -1 }).lean();
    res.json(questions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteQuestion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const q = await QuestionBank.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!q) { res.status(404).json({ error: 'Question not found' }); return; }
    res.json({ message: 'Question deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function bulkSaveQuestions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const questions = req.body.questions.map((q: any) => ({ ...q, userId: req.user!.userId }));
    const saved = await QuestionBank.insertMany(questions);
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
