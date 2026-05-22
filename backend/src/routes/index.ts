import { Router } from 'express';
import { validate, parseJsonFields, assignmentSchema, authSchema, submissionSchema } from '../middleware/validate';
import { upload } from '../middleware/upload';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

import {
  createAssignment, getAssignments, getAssignment, deleteAssignment,
  getAssessmentByAssignment, regenerateAssessment, downloadPdf,
} from '../controllers/assignment.controller';

import { register, login, getMe, listTeachers } from '../controllers/auth.controller';
import { createTemplate, getTemplates, deleteTemplate } from '../controllers/template.controller';
import { saveQuestion, getQuestions, deleteQuestion, bulkSaveQuestions } from '../controllers/questionBank.controller';
import { submitAnswers, getMySubmissions, getSubmissionsForAssessment } from '../controllers/submission.controller';
import { createShareLink, getShareLink } from '../controllers/share.controller';
import { importStudents, bulkCreateAssignments, getStudents } from '../controllers/bulk.controller';

const router = Router();

router.post('/auth/register', validate(authSchema), register);
router.post('/auth/login', validate(authSchema), login);
router.get('/auth/me', authenticate, getMe);
router.get('/auth/teachers', authenticate, listTeachers);

router.post('/assignments', authenticate, upload.single('file'), parseJsonFields(['questionTypes']), validate(assignmentSchema), createAssignment);
router.get('/assignments', authenticate, getAssignments);
router.get('/assignments/:id', authenticate, getAssignment);
router.delete('/assignments/:id', authenticate, deleteAssignment);

router.get('/assessments/:id', optionalAuth, getAssessmentByAssignment);
router.post('/assessments/:id/regenerate', authenticate, regenerateAssessment);
router.get('/assessments/:id/pdf', downloadPdf);

router.post('/templates', authenticate, createTemplate);
router.get('/templates', authenticate, getTemplates);
router.delete('/templates/:id', authenticate, deleteTemplate);

router.post('/question-bank', authenticate, saveQuestion);
router.get('/question-bank', authenticate, getQuestions);
router.delete('/question-bank/:id', authenticate, deleteQuestion);
router.post('/question-bank/bulk', authenticate, bulkSaveQuestions);

router.post('/share', authenticate, createShareLink);
router.get('/share/:code', getShareLink);

router.post('/bulk/students', authenticate, importStudents);
router.post('/bulk/assignments', authenticate, bulkCreateAssignments);
router.get('/students', authenticate, getStudents);

router.post('/submissions', authenticate, validate(submissionSchema), submitAnswers);
router.get('/submissions/mine', authenticate, getMySubmissions);
router.get('/submissions/:id', authenticate, getSubmissionsForAssessment);

export default router;
