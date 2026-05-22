export type QuestionType = 'mcq' | 'short_answer' | 'long_answer' | 'true_false';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AssignmentStatus = 'draft' | 'queued' | 'processing' | 'completed' | 'failed';

export interface QuestionTypeConfig {
  type: QuestionType;
  count: number;
  marksPerQuestion: number;
}

export interface Question {
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
  type: QuestionType;
}

export interface Section {
  name: string;
  title: string;
  instruction: string;
  questions: Question[];
}

export interface AssessmentMetadata {
  totalQuestions: number;
  totalMarks: number;
  timeEstimate?: string;
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  fileUrl?: string;
  additionalInstructions?: string;
  status: AssignmentStatus;
  createdAt: string;
}

export interface Assessment {
  _id: string;
  assignmentId: string;
  title: string;
  generalInstructions: string;
  sections: Section[];
  metadata: AssessmentMetadata;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export interface CreateAssignmentInput {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
}
