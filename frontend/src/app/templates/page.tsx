'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import TopNav from '@/components/layout/TopNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Layers, Trash2, Plus, FileText } from 'lucide-react';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setTemplates(await api.getTemplates()); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try { await api.deleteTemplate(id); setTemplates(p => p.filter(t => t._id !== id)); } catch (err) { console.error(err); }
  };

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-[1100px] mx-auto">
        <div className="bg-white/75 rounded-2xl mb-6" style={{ backdropFilter: 'blur(10px)' }}>
          <TopNav title="Templates" />
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-3xl animate-pulse" />)}</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl">
            <Layers className="h-14 w-14 text-[#dadada] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#2f2f2f] mb-1">No templates yet</h3>
            <p className="text-sm text-[#5d5d5d] mb-6">Save assessment configurations as templates to reuse later.</p>
            <Button onClick={() => router.push('/create')} className="rounded-[48px] bg-[#171717] text-white gap-2">
              <Plus className="h-4 w-4" /> Create Assessment
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl divide-y divide-[#efefef]">
            {templates.map((t: any) => (
              <div key={t._id} className="px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f6f6f6]">
                    <Layers className="h-6 w-6 text-[#5d5d5d]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2f2f2f]">{t.name}</p>
                    <div className="flex items-center gap-2 text-xs text-[#5d5d5d] mt-1">
                      <span>{t.subject} &middot; Grade {t.grade}</span>
                      {t.duration && <><span>&middot;</span><span>{t.duration}</span></>}
                      <span>&middot;</span>
                      <span>{t.questionTypes?.length || 0} question types</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/create?template=${t._id}`)} className="rounded-[48px] text-xs">
                    <Plus className="h-3 w-3" /> Use
                  </Button>
                  <button onClick={() => handleDelete(t._id)} className="p-2 text-[#dadada] hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
