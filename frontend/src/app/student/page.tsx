'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import TopNav from '@/components/layout/TopNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FileText, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMySubmissions().then(setSubmissions).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-[1100px] mx-auto">
        <div className="bg-white/75 rounded-2xl mb-6" style={{ backdropFilter: 'blur(10px)' }}>
          <TopNav title="My Assignments" />
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-3xl animate-pulse" />)}</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl">
            <FileText className="h-14 w-14 text-[#dadada] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#2f2f2f] mb-1">No assignments yet</h3>
            <p className="text-sm text-[#5d5d5d]">Your teacher hasn&apos;t shared any assignments with you.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub: any) => (
              <Link key={sub._id} href={`/student/assessment/${sub.assessmentId?._id || sub.assessmentId}`}
                className="flex items-center justify-between bg-white rounded-3xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f6f6f6]">
                    <FileText className="h-6 w-6 text-[#5d5d5d]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2f2f2f]">{sub.assessmentId?.title || 'Assessment'}</p>
                    <div className="flex items-center gap-3 text-xs text-[#5d5d5d] mt-1">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(sub.submittedAt).toLocaleDateString()}</span>
                      <span>{sub.totalMarksAwarded}/{sub.totalMarks} marks</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={sub.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                    {sub.status === 'graded' ? `${sub.percentage}%` : 'Pending'}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-[#a9a9a9]" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
