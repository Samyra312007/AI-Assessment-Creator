import { Router } from 'express';
import { validate, assignmentSchema } from '../middleware/validate';
import { upload } from '../middleware/upload';
import {
  createAssignment,
  getAssignments,
  getAssignment,
  deleteAssignment,
  getAssessmentByAssignment,
  regenerateAssessment,
  downloadPdf,
} from '../controllers/assignment.controller';

const router = Router();

router.post('/assignments', upload.single('file'), validate(assignmentSchema), createAssignment);
router.get('/assignments', getAssignments);
router.get('/assignments/:id', getAssignment);
router.delete('/assignments/:id', deleteAssignment);

router.get('/assessments/:id', getAssessmentByAssignment);
router.post('/assessments/:id/regenerate', regenerateAssessment);
router.get('/assessments/:id/pdf', downloadPdf);

export default router;
