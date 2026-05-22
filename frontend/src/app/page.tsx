'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Assignment } from '@/types';
import TopNav from '@/components/layout/TopNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText, BookOpen } from 'lucide-react';

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  queued: 'Queued',
  processing: 'Generating...',
  completed: 'Completed',
  failed: 'Failed',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  queued: 'bg-[#ff5623] text-white',
  processing: 'bg-[#ff5623] text-white',
  completed: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
};

export default function Dashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAssignments()
      .then(setAssignments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const inProgress = assignments.filter(a => a.status === 'processing' || a.status === 'queued').length;
  const total = assignments.length;
  const generated = assignments.filter(a => a.status === 'completed').length;
  const recent = assignments.filter(a => a.status === 'completed').slice(0, 4);

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="bg-white/75 rounded-2xl mb-6" style={{ backdropFilter: 'blur(10px)' }}>
        <TopNav title="Dashboard" />
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Assignments in Progress', value: inProgress, color: 'bg-[#ff5623]' },
          { label: 'Total Assignments', value: total, color: 'bg-[#2f2f2f]' },
          { label: 'Generated', value: generated, color: 'bg-[#4bc16c]' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-3xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#5d5d5d]/80">{stat.label}</span>
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-[#2f2f2f]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a9a9a9]" />
          <input
            placeholder="Search"
            className="w-full h-10 pl-10 pr-4 rounded-[100px] border border-[#000] bg-white text-sm text-[#2f2f2f] placeholder:text-[#a9a9a9] outline-none"
          />
        </div>
        <Link href="/create">
          <Button className="h-[46px] px-8 rounded-[48px] gap-2 bg-[#171717] text-white hover:bg-[#2f2f2f]">
            <Plus className="h-4 w-4" /> Create New
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-5">
          {[1, 2].map(i => (
            <div key={i} className="h-40 bg-white rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl">
          <BookOpen className="h-14 w-14 text-[#dadada] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#2f2f2f] mb-1">No assessments yet</h3>
          <p className="text-sm text-[#5d5d5d] mb-6">Create your first AI-generated assessment</p>
          <Link href="/create">
            <Button className="rounded-[48px] bg-[#171717] text-white hover:bg-[#2f2f2f] gap-2">
              <Plus className="h-4 w-4" /> Create Assessment
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {recent.map((assignment) => (
            <Link
              key={assignment._id}
              href={`/assessment/${assignment._id}`}
              className="bg-white rounded-3xl p-6 hover:shadow-lg transition-shadow block"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-2xl font-bold text-[#2f2f2f] leading-tight">{assignment.title}</h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#5d5d5d] mb-4">
                <span>{assignment.subject} &middot; Grade {assignment.grade}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs" style={{ color: 'rgba(0,0,0,0.5)' }}>
                  <span>Assigned on: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                  <span>Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <Badge className={statusColors[assignment.status] || 'bg-gray-100 text-gray-600'}>
                  {statusLabels[assignment.status] || assignment.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
