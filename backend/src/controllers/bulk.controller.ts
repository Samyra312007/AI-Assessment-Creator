import { Response } from 'express';
import { User } from '../models/User';
import { Assignment } from '../models/Assignment';
import { AuthRequest } from '../middleware/auth';

export async function importStudents(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      res.status(400).json({ error: 'Students array is required' });
      return;
    }

    const results = { created: 0, skipped: 0, errors: [] as string[] };
    for (const s of students) {
      try {
        if (!s.email || !s.password || !s.name) {
          results.errors.push(`Missing fields for ${s.email || 'unknown'}`);
          continue;
        }
        const exists = await User.findOne({ email: s.email.toLowerCase() });
        if (exists) { results.skipped++; continue; }
        await new User({ ...s, role: 'student' }).save();
        results.created++;
      } catch (e: any) {
        results.errors.push(`${s.email}: ${e.message}`);
      }
    }

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function bulkCreateAssignments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { assignments } = req.body;
    if (!Array.isArray(assignments) || assignments.length === 0) {
      res.status(400).json({ error: 'Assignments array is required' });
      return;
    }

    const created = [];
    for (const a of assignments) {
      const assignment = new Assignment({
        ...a,
        userId: req.user!.userId,
        dueDate: new Date(a.dueDate),
        status: 'draft',
      });
      await assignment.save();
      created.push(assignment);
    }

    res.status(201).json({ created: created.length, assignments: created });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getStudents(req: AuthRequest, res: Response): Promise<void> {
  try {
    const students = await User.find({ role: 'student' }).select('name email createdAt').sort({ createdAt: -1 }).lean();
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
