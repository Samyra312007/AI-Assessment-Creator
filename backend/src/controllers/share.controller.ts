import { Response } from 'express';
import { ShareLink } from '../models/ShareLink';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export async function createShareLink(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { assessmentId } = req.body;
    const existing = await ShareLink.findOne({ assessmentId, createdBy: req.user!.userId, isActive: true });
    if (existing) {
      res.json({ code: existing.code, url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/assessment/${existing.code}` });
      return;
    }
    const code = uuidv4().slice(0, 8);
    const link = new ShareLink({ assessmentId, createdBy: req.user!.userId, code });
    await link.save();
    res.status(201).json({ code, url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/assessment/${code}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getShareLink(req: AuthRequest, res: Response): Promise<void> {
  try {
    const link = await ShareLink.findOne({ code: req.params.code, isActive: true }).populate('assessmentId');
    if (!link) { res.status(404).json({ error: 'Share link not found or expired' }); return; }
    res.json(link);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
