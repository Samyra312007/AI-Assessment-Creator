'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import TopNav from '@/components/layout/TopNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ChevronDown, ChevronUp, Send } from 'lucide-react';

export default function StudentAssessmentView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { load(); }, [params.id]);

  const load = async () => {
    try {
      const asmt = await api.getAssessment(params.id);
      setAssessment(asmt);
      if (asmt.sections) setExpandedSections(new Set(asmt.sections.map((s: any) => s.name)));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formatted = Object.entries(answers).map(([key, text]) => ({
        questionNumber: parseInt(key), text,
      }));
      await api.submitAnswers({ assessmentId: params.id, answers: formatted });
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ProtectedRoute><div className="p-6 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3" /></div></ProtectedRoute>;

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-[1100px] mx-auto">
        <div className="bg-white/75 rounded-2xl mb-6" style={{ backdropFilter: 'blur(10px)' }}>
          <TopNav title={assessment?.title || 'Assessment'} />
        </div>

        {submitted ? (
          <div className="text-center py-16 bg-white rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-[#2f2f2f] mb-2">Submitted!</h2>
            <p className="text-sm text-[#5d5d5d] mb-6">Your answers have been submitted.</p>
            <Button onClick={() => router.push('/student')} className="rounded-[48px] bg-[#171717] text-white">Back to Dashboard</Button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 space-y-6">
            <div className="pb-4 border-b border-[#dadada]">
              <h1 className="text-xl font-bold text-[#2f2f2f]">{assessment?.title}</h1>
              <p className="text-sm text-[#5d5d5d] mt-1">{assessment?.metadata?.totalQuestions} Questions &middot; {assessment?.metadata?.totalMarks} Marks</p>
            </div>

            {assessment?.generalInstructions && (
              <div className="p-4 rounded-2xl bg-[#f6f6f6] text-sm text-[#5d5d5d]">
                <strong className="text-[#2f2f2f]">Instructions:</strong> {assessment.generalInstructions}
              </div>
            )}

            {assessment?.sections?.map((section: any) => {
              const isExpanded = expandedSections.has(section.name);
              return (
                <div key={section.name} className="border border-[#dadada] rounded-2xl overflow-hidden">
                  <button onClick={() => { const s = new Set(expandedSections); s.has(section.name) ? s.delete(section.name) : s.add(section.name); setExpandedSections(s); }}
                    className="w-full flex items-center justify-between px-5 py-4 bg-[#f6f6f6]">
                    <div className="text-left">
                      <h2 className="text-base font-bold text-[#2f2f2f]">{section.name}: {section.title}</h2>
                      <p className="text-sm text-[#5d5d5d]">{section.instruction}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-[#a9a9a9]" /> : <ChevronDown className="h-5 w-5 text-[#a9a9a9]" />}
                  </button>
                  {isExpanded && (
                    <div className="divide-y divide-[#dadada]">
                      {section.questions.map((q: any) => (
                        <div key={q.number} className="px-5 py-4">
                          <div className="flex items-start gap-3 mb-2">
                            <span className="flex-shrink-0 h-7 w-7 rounded-full bg-[#f6f6f6] flex items-center justify-center text-sm font-bold">{q.number}</span>
                            <div className="flex-1">
                              <p className="text-sm text-[#2f2f2f]">{q.text}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={q.difficulty === 'easy' ? 'easy' : q.difficulty === 'hard' ? 'hard' : 'medium'}>{q.difficulty}</Badge>
                                <span className="text-xs text-[#a9a9a9]">[{q.marks} mark{q.marks > 1 ? 's' : ''}]</span>
                              </div>
                            </div>
                          </div>
                          {(q.type === 'mcq' || q.type === 'true_false') && q.options ? (
                            <div className="ml-10 space-y-2">
                              {q.options.map((opt: string, i: number) => (
                                <label key={i} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${answers[q.number] === String.fromCharCode(65 + i) ? 'bg-[#efefef] border border-[#2f2f2f]' : 'bg-[#f6f6f6] border border-transparent'}`}>
                                  <input type="radio" name={`q-${q.number}`} value={String.fromCharCode(65 + i)}
                                    onChange={() => setAnswers({...answers, [q.number]: String.fromCharCode(65 + i)})}
                                    className="appearance-none w-4 h-4 rounded-full border-2 border-[#dadada] checked:bg-[#2f2f2f] checked:border-[#2f2f2f]" />
                                  <span className="text-sm text-[#2f2f2f]">{opt}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <div className="ml-10">
                              <textarea placeholder="Write your answer here..."
                                value={answers[q.number] || ''}
                                onChange={e => setAnswers({...answers, [q.number]: e.target.value})}
                                className="w-full p-3 rounded-2xl border border-[#dadada] text-sm outline-none focus:border-[#2f2f2f] min-h-[80px]" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex justify-end pt-4 border-t border-[#dadada]">
              <Button onClick={handleSubmit} disabled={submitting} className="rounded-[48px] bg-[#171717] text-white hover:bg-[#2f2f2f] gap-2 px-8 h-11">
                <Send className="h-4 w-4" /> {submitting ? 'Submitting...' : 'Submit Answers'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
