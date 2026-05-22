export type QuestionType = 'mcq' | 'short_answer' | 'long_answer' | 'true_false';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AssignmentStatus = 'draft' | 'queued' | 'processing' | 'completed' | 'failed';
export type JobStatus = 'queued' | 'active' | 'completed' | 'failed' | 'delayed';

export interface IQuestionTypeConfig {
  type: QuestionType;
  count: number;
  marksPerQuestion: number;
}

export interface IQuestion {
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
  type: QuestionType;
}

export interface ISection {
  name: string;
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IAssessmentMetadata {
  totalQuestions: number;
  totalMarks: number;
  timeEstimate?: string;
}

export interface IAssignmentInput {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionTypes: IQuestionTypeConfig[];
  additionalInstructions?: string;
}

export interface IAssessmentOutput {
  title: string;
  generalInstructions: string;
  sections: ISection[];
  metadata: IAssessmentMetadata;
}

export interface IJobProgress {
  jobId: string;
  assignmentId: string;
  status: JobStatus;
  progress: number;
}
