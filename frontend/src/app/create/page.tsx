'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import TopNav from '@/components/layout/TopNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Plus, Upload, Trash2, Sparkles, Check, Bookmark } from 'lucide-react';

const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice Questions' },
  { value: 'short_answer', label: 'Short Answer Questions' },
  { value: 'long_answer', label: 'Long Answer Questions' },
  { value: 'true_false', label: 'True / False' },
] as const;

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required'),
  grade: z.string().min(1, 'Grade is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  duration: z.string().optional(),
  questionTypes: z.array(
    z.object({
      type: z.enum(['mcq', 'short_answer', 'long_answer', 'true_false']),
      count: z.string().min(1, 'Required').refine(
        (v) => !isNaN(Number(v)) && Number(v) >= 1, 'Must be at least 1'
      ),
      marksPerQuestion: z.string().min(1, 'Required').refine(
        (v) => !isNaN(Number(v)) && Number(v) >= 1, 'Must be at least 1'
      ),
    })
  ).min(1, 'Add at least one question type'),
  additionalInstructions: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateAssignment() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [showTemplateInput, setShowTemplateInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());

  const { register, control, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', subject: '', grade: '', dueDate: '', duration: '', questionTypes: [], additionalInstructions: '' },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'questionTypes' });

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
        data.questionTypes.map(qt => ({ type: qt.type, count: Number(qt.count), marksPerQuestion: Number(qt.marksPerQuestion) }))
      ));
      if (data.additionalInstructions) formData.append('additionalInstructions', data.additionalInstructions);
      if (file) formData.append('file', file);
      const result = await api.createAssignment(formData);
      router.push(`/generating/${result.assignmentId}`);
    } catch (error: any) {
      alert(error.message || 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) { alert('Enter a template name'); return; }
    setSavingTemplate(true);
    try {
      await api.createTemplate({
        name: templateName,
        subject: watch('subject'),
        grade: watch('grade'),
        duration: watch('duration'),
        questionTypes: fields.map(f => ({ type: f.type, count: Number(f.count), marksPerQuestion: Number(f.marksPerQuestion) })),
        additionalInstructions: watch('additionalInstructions'),
      });
      setShowTemplateInput(false);
      setTemplateName('');
      alert('Template saved!');
    } catch (err: any) { alert(err.message); } finally { setSavingTemplate(false); }
  };

  return (
    <ProtectedRoute>
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="bg-white/75 rounded-2xl mb-6" style={{ backdropFilter: 'blur(10px)' }}>
        <TopNav title="Create Assignment" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-6">
          <div className="flex-1 bg-white rounded-3xl p-8" style={{ maxWidth: '810px' }}>
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-[#4bc16c]" />
                  <h2 className="text-xl font-bold text-[#2f2f2f]">Create Assignment</h2>
                </div>
                <p className="text-sm text-[#5d5d5d]">Upload your material and add the specification for the assessment here</p>
                <div className="flex items-center gap-1 mt-2">
                  <div className="h-1 flex-1 rounded-full bg-[#5d5d5d]" />
                  <div className="h-1 flex-1 rounded-full bg-[#dadada]" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#2f2f2f] mb-4">Upload Material</h3>
                <div className="rounded-3xl p-8 text-center" style={{ border: '1px solid #000' }}>
                  <Upload className="h-8 w-8 text-[#a9a9a9] mx-auto mb-3" />
                  <p className="text-base font-medium text-[#2f2f2f]">Choose a file...</p>
                  <p className="text-sm text-[#a9a9a9] mb-4">JPEG, PNG, upto 10MB</p>
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="inline-flex items-center px-6 py-2 rounded-[48px] bg-[#f6f6f6] text-[#2f2f2f] text-sm font-medium"
                  >
                    Browse Files
                  </button>
                  <input id="file-upload" type="file" accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  {file && <p className="text-sm text-[#4bc16c] mt-3">{file.name}</p>}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#2f2f2f] mb-4">Assignment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#5d5d5d] mb-1 block">Assignment Title</label>
                    <Input placeholder="Assignment Title" {...register('title')} className="rounded-[100px] border-[#dadada]" />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-[#5d5d5d] mb-1 block">Subject</label>
                    <Select onValueChange={(v) => setValue('subject', v)}>
                      <SelectTrigger className="rounded-[100px] border-[#dadada]"><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        {['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology', 'Computer Science'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-[#5d5d5d] mb-1 block">Grade/Class</label>
                    <Select onValueChange={(v) => setValue('grade', v)}>
                      <SelectTrigger className="rounded-[100px] border-[#dadada]"><SelectValue placeholder="Select grade" /></SelectTrigger>
                      <SelectContent>
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => (
                          <SelectItem key={g} value={g}>Grade {g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.grade && <p className="text-xs text-red-500 mt-1">{errors.grade.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-[#5d5d5d] mb-1 block">Due Date</label>
                    <Input type="date" {...register('dueDate')} className="rounded-[100px] border-[#dadada]" />
                    {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-[#5d5d5d] mb-1 block">Duration</label>
                    <Input placeholder="e.g. 1 hour" {...register('duration')} className="rounded-[100px] border-[#dadada]" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#2f2f2f] mb-4">Question Types</h3>
                <p className="text-sm text-[#5d5d5d] mb-3">Select the type of questions you want in the assessment</p>
                <div className="space-y-3">
                  {QUESTION_TYPES.map((qt) => {
                    const isSelected = selectedTypes.has(qt.value);
                    return (
                      <button
                        key={qt.value}
                        type="button"
                        onClick={() => toggleQuestionType(qt.value)}
                        className="flex items-center gap-3 w-full"
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-[#2a2a2a] border-[#2a2a2a]' : 'border-[#dadada]'}`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm text-[#2f2f2f]">{qt.label}</span>
                      </button>
                    );
                  })}
                </div>

                {fields.length > 0 && (
                  <div className="space-y-3 mt-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-3 p-3 bg-[#f6f6f6] rounded-2xl">
                        <span className="text-sm font-medium flex-1 capitalize">
                          {field.type.replace(/_/g, ' ')} ({field.type === 'mcq' ? 'MCQ' : field.type === 'short_answer' ? 'Short' : field.type === 'long_answer' ? 'Long' : 'T/F'})
                        </span>
                        <div className="w-[100px]">
                          <Input type="number" min="1" placeholder="Count" className="h-11 rounded-[100px] border-[#dadada] text-center" {...register(`questionTypes.${index}.count`)} />
                        </div>
                        <div className="w-[100px]">
                          <Input type="number" min="1" placeholder="Marks" className="h-11 rounded-[100px] border-[#dadada] text-center" {...register(`questionTypes.${index}.marksPerQuestion`)} />
                        </div>
                        <button type="button" onClick={() => { remove(index); const s = new Set(selectedTypes); s.delete(field.type); setSelectedTypes(s); }} className="p-2 text-[#a9a9a9] hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {errors.questionTypes && <p className="text-xs text-red-500 mt-1">{errors.questionTypes.message || errors.questionTypes.root?.message}</p>}

                <button type="button" onClick={() => {
                  const unselected = QUESTION_TYPES.filter(qt => !selectedTypes.has(qt.value));
                  if (unselected.length === 0) { alert('All question types already added'); return; }
                  toggleQuestionType(unselected[0].value);
                }} className="flex items-center gap-3 mt-4 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white text-sm font-bold">+</div>
                  <span className="text-sm font-bold text-[#2f2f2f]">Add another question type</span>
                </button>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <span className="text-base font-medium text-[#2f2f2f]">Total Questions</span>
                  <p className="text-2xl font-bold text-[#2f2f2f]">{fields.reduce((sum, f) => sum + (Number(f.count) || 0), 0)}</p>
                </div>
                <div>
                  <span className="text-base font-medium text-[#2f2f2f]">Total Marks</span>
                  <p className="text-2xl font-bold text-[#2f2f2f]">{fields.reduce((sum, f) => sum + ((Number(f.count) || 0) * (Number(f.marksPerQuestion) || 0)), 0)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#2f2f2f] mb-4">Additional Information</h3>
                <Textarea placeholder="Enter any additional information for the assignment..." className="rounded-2xl border-[#dadada] min-h-[100px]" {...register('additionalInstructions')} />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Button type="button" variant="outline" className="px-8 rounded-[48px] h-11 border-[#dadada]">Previous</Button>
                <Button type="button" onClick={() => setShowTemplateInput(!showTemplateInput)} variant="outline" className="px-6 rounded-[48px] h-11 border-[#dadada] gap-2">
                  <Bookmark className="h-4 w-4" /> Save as Template
                </Button>
                <Button type="submit" className="px-8 rounded-[48px] h-11 bg-[#171717] text-white hover:bg-[#2f2f2f] gap-2" disabled={isSubmitting}>
                  {isSubmitting ? 'Generating...' : <><Sparkles className="h-4 w-4" /> Generate with AI</>}
                </Button>
              </div>
              {showTemplateInput && (
                <div className="flex items-center gap-3 p-4 bg-[#f6f6f6] rounded-2xl">
                  <Input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Template name..." className="flex-1 rounded-[100px] border-[#dadada] h-10" />
                  <Button type="button" onClick={handleSaveTemplate} disabled={savingTemplate} className="rounded-[48px] bg-[#171717] text-white h-10 px-6">
                    {savingTemplate ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="w-[280px] flex-shrink-0">
            <div className="bg-white rounded-3xl p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-[#4bc16c]" />
                <div>
                  <p className="text-sm font-medium text-[#2f2f2f]">Upload Material</p>
                  <p className="text-xs text-[#5d5d5d]">Step 1 of 3</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-6 opacity-50">
                <div className="w-3 h-3 rounded-full bg-[#dadada]" />
                <div>
                  <p className="text-sm font-medium text-[#2f2f2f]">Generate</p>
                  <p className="text-xs text-[#5d5d5d]">Step 2 of 3</p>
                </div>
              </div>
              <div className="flex items-center gap-3 opacity-50">
                <div className="w-3 h-3 rounded-full bg-[#dadada]" />
                <div>
                  <p className="text-sm font-medium text-[#2f2f2f]">Review</p>
                  <p className="text-xs text-[#5d5d5d]">Step 3 of 3</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
    </ProtectedRoute>
  );
}
