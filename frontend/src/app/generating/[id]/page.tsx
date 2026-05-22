'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/lib/socket';
import { useAssessmentStore } from '@/store/assessment';
import { Sparkles, Loader2, CheckCircle2, XCircle, Brain, FileText } from 'lucide-react';

const stages = [
  { key: 'queued', label: 'Queued for generation', icon: FileText },
  { key: 'processing', label: 'AI is generating questions', icon: Brain },
  { key: 'formatting', label: 'Formatting question paper', icon: Sparkles },
  { key: 'completed', label: 'Assessment ready!', icon: CheckCircle2 },
];

export default function GeneratingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { connect, disconnect, onStatus, onCompleted, onFailed } = useSocket(params.id);
  const { generationProgress, generationStatus, setGenerationProgress, setGenerationStatus } = useAssessmentStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    connect();
    onStatus((data) => { setGenerationProgress(data.progress); setGenerationStatus(data.status); });
    onCompleted((data) => {
      setGenerationProgress(100);
      setGenerationStatus('completed');
      setTimeout(() => router.push(`/assessment/${data.assignmentId}`), 1000);
    });
    onFailed((data) => { setError(data.error || 'Generation failed'); setGenerationStatus('failed'); });
    return () => { disconnect(); };
  }, []);

  const currentStage = generationStatus === 'queued' ? 0
    : generationStatus === 'processing' ? (generationProgress < 70 ? 1 : 2)
    : generationStatus === 'completed' ? 3
    : 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full bg-[#2f2f2f] animate-ping opacity-25" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-[#262626] shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#2f2f2f] mb-2">
            {error ? 'Generation Failed' : 'Creating Your Assessment'}
          </h1>
          <p className="text-sm text-[#5d5d5d]">
            {error ? error : 'Our AI is crafting the perfect question paper. This may take a moment.'}
          </p>
        </div>

        {!error && (
          <div className="space-y-4 mb-8">
            <div className="w-full bg-[#dadada] rounded-full h-3 overflow-hidden">
              <div className="h-full rounded-full bg-[#2f2f2f] transition-all duration-500" style={{ width: `${Math.max(generationProgress, 10)}%` }} />
            </div>
            <p className="text-sm text-[#a9a9a9]">{Math.round(generationProgress)}% complete</p>
          </div>
        )}

        <div className="space-y-3 text-left">
          {stages.map((stage, idx) => {
            const isActive = idx === currentStage && !error;
            const isDone = idx < currentStage || (error && idx < currentStage);
            const StageIcon = stage.icon;
            return (
              <div key={stage.key} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive ? 'bg-[#efefef] text-[#2f2f2f]' : isDone ? 'bg-emerald-50 text-emerald-700' : 'text-[#dadada]'}`}>
                {isDone ? <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                  : isActive ? <Loader2 className="h-5 w-5 flex-shrink-0 text-[#2f2f2f] animate-spin" />
                  : <StageIcon className="h-5 w-5 flex-shrink-0" />}
                <span className={`text-sm font-medium ${isActive ? 'text-[#2f2f2f]' : ''}`}>{stage.label}</span>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-8">
            <div className="p-4 bg-red-50 rounded-2xl flex items-start gap-3 mb-4">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-red-800">Something went wrong</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
            <button onClick={() => router.push('/create')} className="text-sm font-medium text-[#2f2f2f] hover:underline">
              Try again with different parameters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
