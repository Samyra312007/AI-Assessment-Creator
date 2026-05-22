'use client';

import TopNav from '@/components/layout/TopNav';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#F5F5F7' }}>
      <TopNav title="Settings" />
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="text-center">
          <Settings className="h-16 w-16 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Settings</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>Settings page coming soon.</p>
        </div>
      </div>
    </div>
  );
}
