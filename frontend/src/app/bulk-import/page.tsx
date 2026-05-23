'use client';

import { useState } from 'react';
import { api, BASE_URL } from '@/lib/api';
import TopNav from '@/components/layout/TopNav';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Upload, Users, Download } from 'lucide-react';

export default function BulkImportPage() {
  const [csvText, setCsvText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);
    setResult(null);
    try {
      const lines = csvText.trim().split('\n').filter(Boolean);
      const students = lines.map(line => {
        const [name, email, password] = line.split(',').map(s => s.trim());
        return { name, email, password };
      });
      const res = await fetch(`${BASE_URL}/bulk/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('vedaai_token')}` },
        body: JSON.stringify({ students }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-[1100px] mx-auto">
        <div className="bg-white/75 rounded-2xl mb-6" style={{ backdropFilter: 'blur(10px)' }}>
          <TopNav title="Bulk Import Students" />
        </div>

        <div className="bg-white rounded-3xl p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-[#2f2f2f] mb-2">Import Student Roster</h3>
            <p className="text-sm text-[#5d5d5d]">Paste CSV data with columns: Name, Email, Password (one per line)</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f6f6]">
            <p className="text-xs text-[#5d5d5d] font-medium mb-2">Format:</p>
            <code className="text-xs text-[#2f2f2f]">John Doe, john@school.com, pass123<br/>Jane Smith, jane@school.com, pass456</code>
          </div>

          <textarea value={csvText} onChange={e => setCsvText(e.target.value)} rows={8}
            className="w-full p-4 rounded-2xl border border-[#dadada] text-sm outline-none focus:border-[#2f2f2f] font-mono"
            placeholder="John Doe, john@example.com, password123&#10;Jane Smith, jane@example.com, password456" />

          <Button onClick={handleImport} disabled={loading || !csvText.trim()} className="rounded-[48px] bg-[#171717] text-white hover:bg-[#2f2f2f] gap-2 h-11 px-8">
            <Upload className="h-4 w-4" /> {loading ? 'Importing...' : 'Import Students'}
          </Button>

          {result && (
            <div className="p-4 rounded-2xl bg-emerald-50">
              <p className="text-sm font-medium text-emerald-800">
                Created: {result.created} | Skipped: {result.skipped} | Errors: {result.errors?.length || 0}
              </p>
              {result.errors?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {result.errors.slice(0, 5).map((e: string, i: number) => (
                    <p key={i} className="text-xs text-red-600">{e}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
