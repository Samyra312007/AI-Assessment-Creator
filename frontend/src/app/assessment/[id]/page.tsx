'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Assessment, Assignment } from '@/types';
import TopNav from '@/components/layout/TopNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Download, RotateCcw, ChevronDown, ChevronUp,
  User, Hash, BookOpen, FileText, Share2, Check,
} from 'lucide-react';

const difficultyConfig = {
  easy: { label: 'Easy', variant: 'easy' as const },
  medium: { label: 'Moderate', variant: 'medium' as const },
  hard: { label: 'Hard', variant: 'hard' as const },
};

export default function AssessmentPage() {
  const params = useParams<{ id: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [studentSection, setStudentSection] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => { loadData(); }, [params.id]);

  const loadData = async () => {
    try {
      const [asmt, assn] = await Promise.all([
        api.getAssessment(params.id),
        api.getAssignment(params.id),
      ]);
      setAssessment(asmt);
      setAssignment(assn);
      if (asmt.sections) setExpandedSections(new Set(asmt.sections.map(s => s.name)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await api.regenerateAssessment(params.id);
      await new Promise(r => setTimeout(r, 2000));
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!assessment) return;
    window.open(api.getPdfUrl(assessment._id), '_blank');
  };

  const toggleSection = (name: string) => {
    const next = new Set(expandedSections);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setExpandedSections(next);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-[1100px] mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="p-6 max-w-[1100px] mx-auto text-center py-20">
        <FileText className="h-16 w-16 text-[#dadada] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#2f2f2f] mb-2">Assessment Not Found</h2>
        <p className="text-[#5d5d5d] mb-6">{error || 'The assessment could not be loaded.'}</p>
        <Button onClick={loadData}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="bg-white/75 rounded-2xl mb-6" style={{ backdropFilter: 'blur(10px)' }}>
        <TopNav title={assessment.title} />
      </div>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-6">
          <div className="p-8 rounded-3xl text-white" style={{ background: 'rgba(23,23,23,0.8)' }}>
            <p className="text-xl font-bold mb-6">Certainly, {studentName || 'Lakshya'}! Below is the assessment for the topic you provided.</p>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{assessment.title}</h1>
                <p className="text-sm opacity-70 mt-1">
                  {assignment?.subject} &middot; Grade {assignment?.grade} &middot; {assessment.metadata.totalQuestions} Questions &middot; {assessment.metadata.totalMarks} Marks
                </p>
              </div>
              <Button onClick={handleDownloadPdf} className="rounded-[100px] bg-white text-[#2f2f2f] hover:bg-gray-100 gap-2 flex-shrink-0">
                <Download className="h-4 w-4" /> Download as PDF
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 space-y-6">
            <div className="grid grid-cols-3 gap-4 pb-6 border-b border-[#dadada]">
              <div className="flex items-center gap-2 border-b border-[#000] pb-1">
                <User className="h-4 w-4 text-[#a9a9a9]" />
                <span className="text-xs text-[#a9a9a9] font-medium uppercase tracking-wider">Name</span>
                <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="flex-1 bg-transparent outline-none text-sm text-[#2f2f2f] placeholder:text-[#dadada]" placeholder="Enter name" />
              </div>
              <div className="flex items-center gap-2 border-b border-[#000] pb-1">
                <Hash className="h-4 w-4 text-[#a9a9a9]" />
                <span className="text-xs text-[#a9a9a9] font-medium uppercase tracking-wider">Roll No.</span>
                <input type="text" value={rollNo} onChange={(e) => setRollNo(e.target.value)} className="flex-1 bg-transparent outline-none text-sm text-[#2f2f2f] placeholder:text-[#dadada]" placeholder="Enter roll no" />
              </div>
              <div className="flex items-center gap-2 border-b border-[#000] pb-1">
                <BookOpen className="h-4 w-4 text-[#a9a9a9]" />
                <span className="text-xs text-[#a9a9a9] font-medium uppercase tracking-wider">Section</span>
                <input type="text" value={studentSection} onChange={(e) => setStudentSection(e.target.value)} className="flex-1 bg-transparent outline-none text-sm text-[#2f2f2f] placeholder:text-[#dadada]" placeholder="Enter section" />
              </div>
            </div>

            {assessment.generalInstructions && (
              <div className="p-4 rounded-2xl bg-[#f6f6f6]">
                <p className="text-sm font-semibold text-[#2f2f2f] mb-1">General Instructions</p>
                <p className="text-sm text-[#5d5d5d] whitespace-pre-line">{assessment.generalInstructions}</p>
              </div>
            )}

            {assessment.sections.map((section) => {
              const isExpanded = expandedSections.has(section.name);
              return (
                <div key={section.name} className="border border-[#dadada] rounded-2xl overflow-hidden">
                  <button onClick={() => toggleSection(section.name)} className="w-full flex items-center justify-between px-5 py-4 bg-[#f6f6f6]">
                    <div className="text-left">
                      <h2 className="text-base font-bold text-[#2f2f2f]">{section.name}: {section.title}</h2>
                      {section.instruction && <p className="text-sm text-[#5d5d5d] mt-0.5">{section.instruction}</p>}
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-[#a9a9a9]" /> : <ChevronDown className="h-5 w-5 text-[#a9a9a9]" />}
                  </button>
                  {isExpanded && (
                    <div className="divide-y divide-[#dadada]">
                      {section.questions.map((question) => {
                        const diff = difficultyConfig[question.difficulty] || difficultyConfig.easy;
                        return (
                          <div key={question.number} className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-[#f6f6f6] text-[#2f2f2f] text-sm font-bold">{question.number}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#2f2f2f] leading-relaxed">{question.text}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant={diff.variant}>{diff.label}</Badge>
                                  <span className="text-xs font-semibold text-[#ff5623] bg-orange-50 px-2 py-0.5 rounded-full">[{question.marks} Mark{question.marks > 1 ? 's' : ''}]</span>
                                  <span className="text-xs text-[#a9a9a9] capitalize">{question.type.replace(/_/g, ' ')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center text-xs text-[#a9a9a9] pb-4">
            Generated by VedaAI Assessment Creator &middot; {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="w-[280px] flex-shrink-0">
          <div className="bg-white rounded-3xl p-6 sticky top-6" style={{ minHeight: '724px' }}>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#4bc16c]" />
                <div>
                  <p className="text-sm font-semibold text-[#2f2f2f]">Upload Material</p>
                  <p className="text-xs text-[#5d5d5d]">Step 1 of 3</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#4bc16c]" />
                <div>
                  <p className="text-sm font-semibold text-[#2f2f2f]">Generate</p>
                  <p className="text-xs text-[#5d5d5d]">Step 2 of 3</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#4bc16c]" />
                <div>
                  <p className="text-sm font-semibold text-[#2f2f2f]">Review</p>
                  <p className="text-xs text-[#5d5d5d]">Step 3 of 3</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button onClick={async () => { try { const res = await fetch(`http://localhost:5000/api/share`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('vedaai_token')}` }, body: JSON.stringify({ assessmentId: assessment._id }) }); const data = await res.json(); navigator.clipboard.writeText(data.url); alert('Share link copied!'); } catch { alert('Failed to create share link'); } }} variant="outline" className="w-full rounded-[100px] border-[#dadada] gap-2">
                <Share2 className="h-4 w-4" /> Share
              </Button>
              <Button onClick={handleDownloadPdf} variant="outline" className="w-full rounded-[100px] border-[#dadada] gap-2">
                <Download className="h-4 w-4" /> Download PDF
              </Button>
              <Button onClick={handleRegenerate} variant="outline" className="w-full rounded-[100px] border-[#dadada] gap-2" disabled={isRegenerating}>
                <RotateCcw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                {isRegenerating ? 'Regenerating...' : 'Regenerate'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
