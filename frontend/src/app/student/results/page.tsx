'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import TopNav from '@/components/layout/TopNav';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function StudentResults() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMySubmissions().then(setSubmissions).catch(console.error).finally(() => setLoading(false));
  }, []);

  const avg = submissions.length ? Math.round(submissions.reduce((s, sub) => s + (sub.percentage || 0), 0) / submissions.length) : 0;
  const graded = submissions.filter(s => s.status === 'graded').length;

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-[1100px] mx-auto">
        <div className="bg-white/75 rounded-2xl mb-6" style={{ backdropFilter: 'blur(10px)' }}>
          <TopNav title="My Results" />
        </div>

        <div className="grid grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-3xl p-5">
            <p className="text-sm text-[#5d5d5d]/80 mb-1">Average Score</p>
            <p className="text-3xl font-bold text-[#2f2f2f]">{avg}%</p>
          </div>
          <div className="bg-white rounded-3xl p-5">
            <p className="text-sm text-[#5d5d5d]/80 mb-1">Completed</p>
            <p className="text-3xl font-bold text-[#2f2f2f]">{graded}</p>
          </div>
          <div className="bg-white rounded-3xl p-5">
            <p className="text-sm text-[#5d5d5d]/80 mb-1">Total Assessments</p>
            <p className="text-3xl font-bold text-[#2f2f2f]">{submissions.length}</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-3xl animate-pulse" />)}</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl">
            <p className="text-sm text-[#5d5d5d]">No results yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl overflow-hidden">
            {submissions.map((sub: any) => (
              <div key={sub._id} className="flex items-center justify-between px-6 py-4 border-b border-[#efefef] last:border-0">
                <div>
                  <p className="font-medium text-[#2f2f2f]">{sub.assessmentId?.title || 'Assessment'}</p>
                  <p className="text-xs text-[#5d5d5d]">{sub.totalMarksAwarded}/{sub.totalMarks} marks</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-[#efefef] overflow-hidden">
                    <div className="h-full bg-[#2f2f2f] rounded-full" style={{ width: `${sub.percentage}%` }} />
                  </div>
                  <span className={`text-sm font-bold ${sub.percentage >= 60 ? 'text-emerald-600' : sub.percentage >= 35 ? 'text-amber-600' : 'text-red-600'}`}>
                    {sub.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
