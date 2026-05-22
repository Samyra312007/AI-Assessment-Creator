'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Assignment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileText, ArrowRight, Trash2, Sparkles } from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'default' | 'easy' | 'medium' | 'hard' | 'indigo' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'outline' },
  queued: { label: 'Queued', variant: 'medium' },
  processing: { label: 'Generating...', variant: 'medium' },
  completed: { label: 'Completed', variant: 'easy' },
  failed: { label: 'Failed', variant: 'hard' },
};

export default function AssessmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await api.getAssignments();
      setAssignments(data);
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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Assessments</h1>
          <p className="text-gray-500 mt-1">View and manage all your created assessments</p>
        </div>
        <Link href="/create">
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" /> New Assessment
          </Button>
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by title or subject..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {search ? 'No matching assessments' : 'No assessments yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {search ? 'Try a different search term' : 'Create your first AI-generated assessment'}
              </p>
              {!search && (
                <Link href="/create">
                  <Button variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" /> Create Assessment
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((assignment) => (
                <div key={assignment._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
                  <Link
                    href={
                      assignment.status === 'completed'
                        ? `/assessment/${assignment._id}`
                        : `/generating/${assignment._id}`
                    }
                    className="flex items-center gap-4 flex-1 min-w-0"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex-shrink-0">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {assignment.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {assignment.subject} &middot; Grade {assignment.grade} &middot;{' '}
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={statusConfig[assignment.status]?.variant || 'outline'}>
                      {statusConfig[assignment.status]?.label || assignment.status}
                    </Badge>
                    {assignment.status === 'completed' && (
                      <Link href={`/assessment/${assignment._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-300 hover:text-red-500"
                      onClick={() => handleDelete(assignment._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
