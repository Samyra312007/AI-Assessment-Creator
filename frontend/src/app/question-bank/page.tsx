'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import TopNav from '@/components/layout/TopNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BookOpen, Search, Trash2 } from 'lucide-react';

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      const data = await api.getQuestionBank(params.toString());
      setQuestions(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    try { await api.deleteQuestion(id); setQuestions(p => p.filter(q => q._id !== id)); } catch (err) { console.error(err); }
  };

  const filtered = questions.filter(q => q.text.toLowerCase().includes(search.toLowerCase()));

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-[1100px] mx-auto">
        <div className="bg-white/75 rounded-2xl mb-6" style={{ backdropFilter: 'blur(10px)' }}>
          <TopNav title="Question Bank" />
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a9a9a9]" />
            <input placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-[100px] border border-[#000] bg-white text-sm outline-none" />
          </div>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); }}
            className="h-10 px-4 rounded-[100px] border border-[#dadada] bg-white text-sm outline-none">
            <option value="">All Types</option>
            <option value="mcq">MCQ</option>
            <option value="short_answer">Short Answer</option>
            <option value="long_answer">Long Answer</option>
            <option value="true_false">True/False</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-3xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl">
            <BookOpen className="h-14 w-14 text-[#dadada] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#2f2f2f] mb-1">Question bank is empty</h3>
            <p className="text-sm text-[#5d5d5d]">Questions are automatically saved when you generate assessments.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl divide-y divide-[#efefef]">
            {filtered.map((q: any) => (
              <div key={q._id} className="px-6 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#2f2f2f]">{q.text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={q.difficulty === 'easy' ? 'easy' : q.difficulty === 'hard' ? 'hard' : 'medium'}>{q.difficulty}</Badge>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#f6f6f6] text-[#5d5d5d] capitalize">{q.type.replace('_', ' ')}</span>
                    <span className="text-xs text-[#a9a9a9]">{q.subject} &middot; Grade {q.grade} &middot; {q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(q._id)} className="p-2 text-[#dadada] hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
