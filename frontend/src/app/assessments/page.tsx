'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Assignment } from '@/types';
import TopNav from '@/components/layout/TopNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, FileText, ArrowRight, Trash2, Plus } from 'lucide-react';

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

export default function AssessmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await api.getAssignments();
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assessment?')) return;
    try {
      await api.deleteAssignment(id);
      setAssignments(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = assignments.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="bg-white/75 rounded-2xl mb-6" style={{ backdropFilter: 'blur(10px)' }}>
        <TopNav title="My Assessments" />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a9a9a9]" />
          <input
            placeholder="Search by title or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-[100px] border border-[#000] bg-white text-sm text-[#2f2f2f] placeholder:text-[#a9a9a9] outline-none"
          />
        </div>
        <Link href="/create">
          <Button className="h-[46px] px-8 rounded-[48px] gap-2 bg-[#171717] text-white hover:bg-[#2f2f2f]">
            <Plus className="h-4 w-4" /> New Assessment
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-[#f6f6f6] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-[#dadada] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#2f2f2f] mb-1">
              {search ? 'No matching assessments' : 'No assessments yet'}
            </h3>
            <p className="text-sm text-[#5d5d5d] mb-4">
              {search ? 'Try a different search term' : 'Create your first AI-generated assessment'}
            </p>
            {!search && (
              <Link href="/create">
                <Button className="rounded-[48px] bg-[#171717] text-white hover:bg-[#2f2f2f] gap-2">
                  <Plus className="h-4 w-4" /> Create Assessment
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#efefef]">
            {filtered.map((assignment) => (
              <div key={assignment._id} className="flex items-center justify-between px-6 py-4 hover:bg-[#f6f6f6] transition-colors group">
                <Link
                  href={assignment.status === 'completed' ? `/assessment/${assignment._id}` : `/generating/${assignment._id}`}
                  className="flex items-center gap-4 flex-1 min-w-0"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6f6f6] flex-shrink-0">
                    <FileText className="h-5 w-5 text-[#5d5d5d]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#2f2f2f] truncate">{assignment.title}</p>
                    <p className="text-sm text-[#5d5d5d]">
                      {assignment.subject} &middot; Grade {assignment.grade} &middot;{' '}
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge className={statusColors[assignment.status] || 'bg-gray-100 text-gray-600'}>
                    {statusLabels[assignment.status] || assignment.status}
                  </Badge>
                  {assignment.status === 'completed' && (
                    <Link href={`/assessment/${assignment._id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#dadada] hover:text-red-500" onClick={() => handleDelete(assignment._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
