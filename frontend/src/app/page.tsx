'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Assignment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FilePlus2, FileText, Clock, Sparkles, ArrowRight, BookOpen } from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'default' | 'easy' | 'medium' | 'hard' | 'indigo' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'outline' },
  queued: { label: 'Queued', variant: 'medium' },
  processing: { label: 'Generating...', variant: 'medium' },
  completed: { label: 'Completed', variant: 'easy' },
  failed: { label: 'Failed', variant: 'hard' },
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

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome to your AI-powered assessment hub</p>
        </div>
        <Link href="/create">
          <Button className="gap-2">
            <FilePlus2 className="h-4 w-4" />
            Create New Assessment
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
              <p className="text-sm text-gray-500">Total Assessments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <Sparkles className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter(a => a.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-500">Generated</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter(a => a.status === 'processing' || a.status === 'queued').length}
              </p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No assessments yet</h3>
              <p className="text-gray-500 mb-4">Create your first AI-generated assessment</p>
              <Link href="/create">
                <Button variant="outline" className="gap-2">
                  <FilePlus2 className="h-4 w-4" />
                  Create Assessment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {assignments.map((assignment) => (
                <Link
                  key={assignment._id}
                  href={
                    assignment.status === 'completed'
                      ? `/assessment/${assignment._id}`
                      : assignment.status === 'failed'
                      ? '/create'
                      : `/generating/${assignment._id}`
                  }
                  className="flex items-center justify-between py-4 px-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {assignment.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {assignment.subject} &middot; Grade {assignment.grade}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusConfig[assignment.status]?.variant || 'outline'}>
                      {statusConfig[assignment.status]?.label || assignment.status}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
