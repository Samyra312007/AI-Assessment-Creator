import { Request, Response } from 'express';
import { User } from '../models/User';
import { signToken, AuthRequest } from '../middleware/auth';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, role, schoolName, schoolLocation } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const user = new User({ name, email, password, role: role || 'teacher', schoolName, schoolLocation });
    await user.save();

    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });

    res.status(201).json({ token, user: user.toJSON() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });
    res.json({ token, user: user.toJSON() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user.toJSON());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function listTeachers(_req: Request, res: Response): Promise<void> {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password').lean();
    res.json(teachers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
