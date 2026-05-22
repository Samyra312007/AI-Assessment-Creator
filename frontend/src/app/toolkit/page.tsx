'use client';

import TopNav from '@/components/layout/TopNav';
import { Bot } from 'lucide-react';

export default function Page() {
  return (
    <div className="min-h-screen" style={{ background: '#F5F5F7' }}>
      <TopNav title="AI Teacher's Toolkit" />
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="text-center">
          <Bot className="h-16 w-16 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>AI Teacher's Toolkit</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>This page is coming soon.</p>
        </div>
      </div>
    </div>
  );
}
