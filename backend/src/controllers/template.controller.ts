import { Response } from 'express';
import { Template } from '../models/Template';
import { AuthRequest } from '../middleware/auth';

export async function createTemplate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const template = new Template({ ...req.body, userId: req.user!.userId });
    await template.save();
    res.status(201).json(template);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getTemplates(req: AuthRequest, res: Response): Promise<void> {
  try {
    const templates = await Template.find({ userId: req.user!.userId }).sort({ createdAt: -1 }).lean();
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteTemplate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const template = await Template.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!template) { res.status(404).json({ error: 'Template not found' }); return; }
    res.json({ message: 'Template deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
