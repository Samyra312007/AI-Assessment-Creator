'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import TopNav from '@/components/layout/TopNav';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BarChart3, Users, FileText, Award } from 'lucide-react';

export default function AnalyticsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAssignments().then(res => setAssignments(res.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const total = assignments.length;
  const completed = assignments.filter(a => a.status === 'completed').length;
  const failed = assignments.filter(a => a.status === 'failed').length;
  const inProgress = assignments.filter(a => a.status === 'processing' || a.status === 'queued').length;

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-[1100px] mx-auto">
        <div className="bg-white/75 rounded-2xl mb-6" style={{ backdropFilter: 'blur(10px)' }}>
          <TopNav title="Analytics" />
        </div>

        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Assessments', value: total, icon: FileText, color: '#2f2f2f' },
            { label: 'Completed', value: completed, icon: Award, color: '#4bc16c' },
            { label: 'In Progress', value: inProgress, icon: BarChart3, color: '#ff5623' },
            { label: 'Failed', value: failed, icon: Users, color: '#dc2626' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-3xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#5d5d5d]/80">{stat.label}</span>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
              </div>
              <p className="text-3xl font-bold text-[#2f2f2f]">{stat.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-3xl animate-pulse" />)}</div>
        ) : (
          <div className="bg-white rounded-3xl p-6">
            <h3 className="font-bold text-[#2f2f2f] mb-4">Assessment Status Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#5d5d5d] w-24">Completed</span>
                <div className="flex-1 h-3 rounded-full bg-[#efefef] overflow-hidden">
                  <div className="h-full bg-[#4bc16c] rounded-full" style={{ width: `${total ? (completed / total) * 100 : 0}%` }} />
                </div>
                <span className="text-sm font-medium text-[#2f2f2f] w-10 text-right">{completed}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#5d5d5d] w-24">In Progress</span>
                <div className="flex-1 h-3 rounded-full bg-[#efefef] overflow-hidden">
                  <div className="h-full bg-[#ff5623] rounded-full" style={{ width: `${total ? (inProgress / total) * 100 : 0}%` }} />
                </div>
                <span className="text-sm font-medium text-[#2f2f2f] w-10 text-right">{inProgress}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#5d5d5d] w-24">Failed</span>
                <div className="flex-1 h-3 rounded-full bg-[#efefef] overflow-hidden">
                  <div className="h-full bg-[#dc2626] rounded-full" style={{ width: `${total ? (failed / total) * 100 : 0}%` }} />
                </div>
                <span className="text-sm font-medium text-[#2f2f2f] w-10 text-right">{failed}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
