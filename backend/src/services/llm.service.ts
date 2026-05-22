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

OUTPUT FORMAT (valid JSON only):
{
  "title": "${input.title}",
  "generalInstructions": "Clear exam instructions for students",
  "sections": [
    {
      "name": "Section A",
      "title": "Objective / Easy Questions",
      "instruction": "Attempt all questions",
      "questions": [
        {
          "number": 1,
          "text": "Question text here",
          "difficulty": "easy",
          "marks": <marks>,
          "type": "<type>"
        }
      ]
    }
  ],
  "metadata": {
    "totalQuestions": <total>,
    "totalMarks": <total_marks>,
    "timeEstimate": "3 Hours"
  }
}

RULES:
- Section A = easy questions, Section B = medium questions, Section C = hard questions (if mixture, distribute accordingly)
- DO NOT include section D/E unless needed
- Ensure age-appropriate and curriculum-relevant content
- Return ONLY valid JSON. No markdown, no explanation, no code fences.`;
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

export async function generateQuestions(input: IAssignmentInput): Promise<IAssessmentOutput> {
  if (!config.openaiApiKey) {
    return generateFallback(input);
  }

  const openai = new OpenAI({ apiKey: config.openaiApiKey });
  const prompt = buildPrompt(input);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are an expert educational assessment generator. Always return valid JSON.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from LLM');

  try {
    return parseResponse(content);
  } catch (parseErr) {
    // Retry once with stricter instruction
    const retryResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational assessment generator. Your response must be ONLY valid JSON matching the specified schema exactly. No markdown, no code fences.',
        },
        { role: 'user', content: prompt + '\n\nIMPORTANT: Return ONLY valid JSON. No markdown. No code fences.' },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const retryContent = retryResponse.choices[0]?.message?.content;
    if (!retryContent) throw new Error('Empty response on retry');
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
