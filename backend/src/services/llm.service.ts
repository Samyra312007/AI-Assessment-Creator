import OpenAI from 'openai';
import { config } from '../config';
import { IAssignmentInput, IAssessmentOutput } from '../types';
import { z } from 'zod';

const QuestionSchema = z.object({
  number: z.number(),
  text: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.number(),
  type: z.enum(['mcq', 'short_answer', 'long_answer', 'true_false']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
});

const SectionSchema = z.object({
  name: z.string(),
  title: z.string(),
  instruction: z.string(),
  questions: z.array(QuestionSchema),
});

const AssessmentOutputSchema = z.object({
  title: z.string(),
  generalInstructions: z.string(),
  sections: z.array(SectionSchema),
  metadata: z.object({
    totalQuestions: z.number(),
    totalMarks: z.number(),
    timeEstimate: z.string().optional(),
  }),
});

function buildPrompt(input: IAssignmentInput): string {
  const typesDesc = input.questionTypes
    .map(qt => `${qt.count} ${qt.type.replace('_', ' ')} questions (${qt.marksPerQuestion} marks each)`)
    .join(', ');

  return `You are an expert question paper generator for ${input.subject} at ${input.grade} level.

Generate a question paper with the following specifications:
- Subject: ${input.subject}
- Grade: ${input.grade}
- Question Types & Count: ${typesDesc}
${input.additionalInstructions ? `- Additional Instructions: ${input.additionalInstructions}` : ''}

OUTPUT must be ONLY valid JSON with NO markdown, NO code fences, NO explanation. Schema:
{
  "title": "${input.title}",
  "generalInstructions": "...",
  "sections": [
    {
      "name": "Section A",
      "title": "Easy Questions",
      "instruction": "Attempt all questions",
      "questions": [
        {
          "number": 1,
          "text": "...",
          "difficulty": "easy",
          "marks": <number>,
          "type": "mcq|short_answer|long_answer|true_false"
        }
      ]
    }
  ],
  "metadata": {
    "totalQuestions": <number>,
    "totalMarks": <number>,
    "timeEstimate": "3 Hours"
  }
}

For MCQ and True/False questions, include:
- "options": ["A. option1", "B. option2", "C. option3", "D. option4"]
- "correctAnswer": "A" (the correct option letter)
For MCQ questions, always provide 4 options.

RULES:
- Section A = easy questions, Section B = medium, Section C = hard
- Distribute question types across sections
- Age-appropriate, curriculum-relevant content
- Return ONLY the JSON object, nothing else.`;
}

function parseResponse(raw: string): IAssessmentOutput {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    const lines = cleaned.split('\n');
    if (lines[0].includes('json')) lines.shift();
    else lines.shift();
    if (lines[lines.length - 1].startsWith('```')) lines.pop();
    cleaned = lines.join('\n');
  }

  const parsed = JSON.parse(cleaned);
  return AssessmentOutputSchema.parse(parsed);
}

function getClient(): { client: OpenAI; model: string; supportsJsonMode: boolean } {
  if (config.llmProvider === 'openai' && config.openai.apiKey) {
    return {
      client: new OpenAI({ apiKey: config.openai.apiKey }),
      model: config.openai.model,
      supportsJsonMode: true,
    };
  }

  if (config.llmProvider === 'nvidia-nim' && config.nvidiaNim.apiKey) {
    return {
      client: new OpenAI({
        apiKey: config.nvidiaNim.apiKey,
        baseURL: config.nvidiaNim.baseUrl,
      }),
      model: config.nvidiaNim.model,
      supportsJsonMode: false,
    };
  }

  return { client: null as any, model: '', supportsJsonMode: false };
}

async function callLlm(input: IAssignmentInput, strict: boolean): Promise<string> {
  const { client, model, supportsJsonMode } = getClient();
  const prompt = buildPrompt(input);

  const systemMsg = strict
    ? 'You are an expert educational assessment generator. Your response must be ONLY valid JSON matching the specified schema exactly. No markdown, no code fences, no explanation.'
    : 'You are an expert educational assessment generator. Always return valid JSON.';

  const userMsg = strict
    ? prompt + '\n\nIMPORTANT: Return ONLY valid JSON. No markdown. No code fences.'
    : prompt;

  const params: any = {
    model,
    messages: [
      { role: 'system' as const, content: systemMsg },
      { role: 'user' as const, content: userMsg },
    ],
    temperature: strict ? 0.3 : 0.7,
  };

  if (supportsJsonMode) {
    params.response_format = { type: 'json_object' };
  }

  const response = await client.chat.completions.create(params);
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from LLM');
  return content;
}

export async function generateQuestions(input: IAssignmentInput): Promise<IAssessmentOutput> {
  const { client } = getClient();
  if (!client) {
    console.log('No LLM API key configured — using fallback question generator');
    return generateFallback(input);
  }

  try {
    const content = await callLlm(input, false);
    return parseResponse(content);
  } catch (err) {
    console.warn('First LLM attempt failed, retrying with stricter prompt:', (err as Error).message);
    const retryContent = await callLlm(input, true);
    return parseResponse(retryContent);
  }
}

function generateFallback(input: IAssignmentInput): IAssessmentOutput {
  const sections = input.questionTypes.map((qt, idx) => {
    const sectionNames = ['A', 'B', 'C', 'D', 'E'];
    const sectionLabel = sectionNames[idx] || String.fromCharCode(65 + idx);
    const difficulty = idx === 0 ? 'easy' : idx === 1 ? 'medium' : 'hard';

    const questions = Array.from({ length: qt.count }, (_, i) => ({
      number: i + 1,
      text: `Sample ${qt.type.replace('_', ' ')} question ${i + 1} for ${input.subject} (Grade ${input.grade})`,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      marks: qt.marksPerQuestion,
      type: qt.type,
      ...(qt.type === 'mcq' ? { options: ['A. Option 1', 'B. Option 2', 'C. Option 3', 'D. Option 4'], correctAnswer: 'A' } : {}),
      ...(qt.type === 'true_false' ? { options: ['A. True', 'B. False'], correctAnswer: 'A' } : {}),
    }));

    return {
      name: `Section ${sectionLabel}`,
      title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Questions`,
      instruction: 'Attempt all questions',
      questions,
    };
  });

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
  const totalMarks = sections.reduce((sum, s) => sum + s.questions.reduce((qs, q) => qs + q.marks, 0), 0);

  return {
    title: input.title,
    generalInstructions: `Answer all questions. Duration: 3 Hours. Read each question carefully before answering.`,
    sections,
    metadata: { totalQuestions, totalMarks, timeEstimate: '3 Hours' },
  };
}

export { AssessmentOutputSchema };
