'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  Check,
  HelpCircle,
  AlignLeft,
  CheckSquare,
} from 'lucide-react';

const QUESTION_TYPES = [
  { value: 'mcq', label: 'MCQ', icon: CheckSquare, color: 'text-blue-600 bg-blue-50' },
  { value: 'short_answer', label: 'Short Answer', icon: HelpCircle, color: 'text-emerald-600 bg-emerald-50' },
  { value: 'long_answer', label: 'Long Answer', icon: AlignLeft, color: 'text-purple-600 bg-purple-50' },
  { value: 'true_false', label: 'True/False', icon: Check, color: 'text-amber-600 bg-amber-50' },
] as const;

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required'),
  grade: z.string().min(1, 'Grade is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  questionTypes: z.array(
    z.object({
      type: z.enum(['mcq', 'short_answer', 'long_answer', 'true_false']),
      count: z.string().min(1, 'Required').refine(
        (v) => !isNaN(Number(v)) && Number(v) >= 1,
        'Must be at least 1'
      ),
      marksPerQuestion: z.string().min(1, 'Required').refine(
        (v) => !isNaN(Number(v)) && Number(v) >= 1,
        'Must be at least 1'
      ),
    })
  ).min(1, 'Add at least one question type'),
  additionalInstructions: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateAssignment() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subject: '',
      grade: '',
      dueDate: '',
      questionTypes: [],
      additionalInstructions: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questionTypes',
  });

  const toggleQuestionType = (type: string) => {
    if (selectedTypes.has(type)) {
      const idx = fields.findIndex(f => f.type === type);
      if (idx !== -1) remove(idx);
      selectedTypes.delete(type);
      setSelectedTypes(new Set(selectedTypes));
    } else {
      append({ type: type as any, count: '1', marksPerQuestion: '1' });
      selectedTypes.add(type);
      setSelectedTypes(new Set(selectedTypes));
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('subject', data.subject);
      formData.append('grade', data.grade);
      formData.append('dueDate', new Date(data.dueDate).toISOString());
      formData.append('questionTypes', JSON.stringify(
        data.questionTypes.map(qt => ({
          type: qt.type,
          count: Number(qt.count),
          marksPerQuestion: Number(qt.marksPerQuestion),
        }))
      ));
      if (data.additionalInstructions) {
        formData.append('additionalInstructions', data.additionalInstructions);
      }
      if (file) {
        formData.append('file', file);
      }

      const result = await api.createAssignment(formData);
      router.push(`/generating/${result.assignmentId}`);
    } catch (error: any) {
      alert(error.message || 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Assessment</h1>
        <p className="text-gray-500 mt-1">Fill in the details and let AI generate your question paper</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Details</CardTitle>
                <CardDescription>Set up the core information for your assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Assessment Title</Label>
                  <Input id="title" placeholder="e.g. Mid-Term Mathematics Exam" {...register('title')} />
                  {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select onValueChange={(v) => setValue('subject', v)}>
                      <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        {['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology', 'Computer Science'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="grade">Grade / Class</Label>
                    <Select onValueChange={(v) => setValue('grade', v)}>
                      <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                      <SelectContent>
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => (
                          <SelectItem key={g} value={g}>Grade {g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.grade && <p className="text-sm text-red-500 mt-1">{errors.grade.message}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" {...register('dueDate')} />
                  {errors.dueDate && <p className="text-sm text-red-500 mt-1">{errors.dueDate.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question Types</CardTitle>
                <CardDescription>Select the types of questions to include</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {QUESTION_TYPES.map((qt) => {
                    const isSelected = selectedTypes.has(qt.value);
                    const Icon = qt.icon;
                    return (
                      <button
                        key={qt.value}
                        type="button"
                        onClick={() => toggleQuestionType(qt.value)}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${qt.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-600'}`}>
                          {qt.label}
                        </span>
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {fields.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <Label>Configure Count & Marks</Label>
                    {fields.map((field, index) => {
                      const qt = QUESTION_TYPES.find(q => q.value === field.type);
                      const Icon = qt?.icon;
                      return (
                        <div key={field.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`p-1.5 rounded ${qt?.color || 'bg-gray-100'}`}>
                            {Icon && <Icon className="h-4 w-4" />}
                          </div>
                          <span className="text-sm font-medium flex-1 capitalize">
                            {field.type.replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-20">
                              <Input
                                type="number"
                                min="1"
                                placeholder="Count"
                                className="h-8 text-xs"
                                {...register(`questionTypes.${index}.count`)}
                              />
                            </div>
                            <span className="text-xs text-gray-400">×</span>
                            <div className="w-20">
                              <Input
                                type="number"
                                min="1"
                                placeholder="Marks"
                                className="h-8 text-xs"
                                {...register(`questionTypes.${index}.marksPerQuestion`)}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                remove(index);
                                const newSet = new Set(selectedTypes);
                                newSet.delete(field.type);
                                setSelectedTypes(newSet);
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {errors.questionTypes && (
                  <p className="text-sm text-red-500">{errors.questionTypes.message || errors.questionTypes.root?.message}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Options</CardTitle>
                <CardDescription>Upload reference material and add instructions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Upload Reference (PDF / Text) — Optional</Label>
                  <div
                    className="mt-1 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {file ? file.name : 'Drop a file here or click to browse'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF, TXT, DOC up to 10MB</p>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="instructions">Additional Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    placeholder="e.g. Focus on chapters 3-5, include real-world application questions..."
                    className="mt-1"
                    {...register('additionalInstructions')}
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Generating...</>
              ) : (
                <><Sparkles className="h-5 w-5" /> Generate with AI</>
              )}
            </Button>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  AI Summary
                </CardTitle>
                <CardDescription>Your assessment at a glance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                  <p className="text-xs text-indigo-600 font-medium">What happens next?</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Our AI will analyze your inputs and generate a structured question paper with sections, varied difficulty levels, and proper marking scheme.
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subject</span>
                    <span className="font-medium">{watch('subject') || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Grade</span>
                    <span className="font-medium">{watch('grade') ? `Grade ${watch('grade')}` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Question Types</span>
                    <span className="font-medium">{fields.length || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Questions</span>
                    <span className="font-medium">
                      {fields.reduce((sum, f) => sum + (Number(f.count) || 0), 0) || '—'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
