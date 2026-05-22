'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Assessment, Assignment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Download,
  RotateCcw,
  Printer,
  FileText,
  Sparkles,
  Clock,
  BarChart3,
  ChevronDown,
  ChevronUp,
  User,
  Hash,
  BookOpen,
} from 'lucide-react';
import { useState as useReactState } from 'react';

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

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const [asmt, assn] = await Promise.all([
        api.getAssessment(params.id),
        api.getAssignment(params.id),
      ]);
      setAssessment(asmt);
      setAssignment(assn);
      if (asmt.sections) {
        setExpandedSections(new Set(asmt.sections.map(s => s.name)));
      }
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
      // Wait a bit then reload
      await new Promise(r => setTimeout(r, 2000));
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!assessment) return;
    try {
      const pdfUrl = api.getPdfUrl(assessment._id);
      window.open(pdfUrl, '_blank');
    } catch (err: any) {
      alert('Failed to download PDF');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSection = (name: string) => {
    const next = new Set(expandedSections);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setExpandedSections(next);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-20">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Assessment Not Found</h2>
        <p className="text-gray-500 mb-6">{error || 'The assessment could not be loaded.'}</p>
        <Button onClick={loadData}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto print:p-0">
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {assignment?.subject} &middot; Grade {assignment?.grade}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="gap-1.5">
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={isRegenerating} className="gap-1.5">
            <RotateCcw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </Button>
        </div>
      </div>

      {/* Question Paper */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden print:border-0 print:shadow-none">
        {/* Header */}
        <div className="px-8 py-6 border-b-2 border-gray-900 text-center print:border-b-2">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{assessment.title}</h1>
          <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> Time: {assessment.metadata.timeEstimate || '3 Hours'}
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" /> Max Marks: {assessment.metadata.totalMarks}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> Questions: {assessment.metadata.totalQuestions}
            </span>
          </div>
        </div>

        {/* Student Info */}
        <div className="px-8 py-5 border-b border-gray-200 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 border-b border-gray-400 pb-1">
              <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Name</span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-300 p-0"
                placeholder="Enter your name"
              />
            </div>
            <div className="flex items-center gap-2 border-b border-gray-400 pb-1">
              <Hash className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Roll No.</span>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-300 p-0"
                placeholder="Enter roll number"
              />
            </div>
            <div className="flex items-center gap-2 border-b border-gray-400 pb-1">
              <BookOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Section</span>
              <input
                type="text"
                value={studentSection}
                onChange={(e) => setStudentSection(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-300 p-0"
                placeholder="Enter section"
              />
            </div>
          </div>
        </div>

        {/* General Instructions */}
        <div className="px-8 py-5 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">General Instructions</h3>
          <div className="bg-indigo-50 rounded-xl px-5 py-4 border-l-4 border-indigo-500">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {assessment.generalInstructions}
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="px-8 py-5 space-y-6">
          {assessment.sections.map((section) => {
            const isExpanded = expandedSections.has(section.name);
            return (
              <div key={section.name} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection(section.name)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100/70 transition-colors"
                >
                  <div className="text-left">
                    <h2 className="text-base font-bold text-gray-900">
                      {section.name}: {section.title}
                    </h2>
                    <p className="text-sm text-gray-500 italic mt-0.5">{section.instruction}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {section.questions.map((question) => {
                      const diff = difficultyConfig[question.difficulty] || difficultyConfig.easy;
                      return (
                        <div key={question.number} className="px-5 py-4 hover:bg-gray-50/50 transition-colors animate-slide-up">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">
                              {question.number}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 leading-relaxed">
                                {question.text}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={diff.variant}>
                                  {diff.label}
                                </Badge>
                                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                  [{question.marks} Mark{question.marks > 1 ? 's' : ''}]
                                </span>
                                <span className="text-xs text-gray-400 capitalize">
                                  {question.type.replace('_', ' ')}
                                </span>
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

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-200 text-center text-xs text-gray-400 print:block">
          Generated by VedaAI Assessment Creator &middot; {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Metadata Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 print:hidden">
        {[
          { label: 'Total Questions', value: assessment.metadata.totalQuestions, icon: FileText, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Total Marks', value: assessment.metadata.totalMarks, icon: BarChart3, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Time Estimate', value: assessment.metadata.timeEstimate || '3 Hours', icon: Clock, color: 'text-amber-600 bg-amber-50' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
