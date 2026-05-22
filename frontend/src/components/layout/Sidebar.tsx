'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { LayoutGrid, Users, FileText, Bot, Library, Settings, Plus, LogOut, Sparkles } from 'lucide-react';

const navItems = [
  { href: '/', icon: LayoutGrid, label: 'Home' },
  { href: '/groups', icon: Users, label: 'My Groups' },
  { href: '/assessments', icon: FileText, label: 'Assignments' },
  { href: '/toolkit', icon: Bot, label: "AI Teacher's Toolkit" },
  { href: '/library', icon: Library, label: 'My Library' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen flex flex-col overflow-hidden"
      style={{
        width: '328px',
        background: '#FFFFFF',
        borderRadius: '0 24px 24px 0',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        padding: '32px 24px',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3" style={{ marginBottom: '48px' }}>
        <div
          className="flex items-center justify-center"
          style={{ width: '40px', height: '40px', background: '#FF6B35', borderRadius: '10px' }}
        >
          <span className="text-white text-lg font-bold leading-none">V</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1A1A1A' }}>VedaAI</h1>
      </div>

      {/* Create Assignment Button */}
      <button
        onClick={() => router.push('/create')}
        className="flex items-center justify-center gap-2 w-full"
        style={{
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: '2px solid #FF4D4D',
          borderRadius: '12px',
          padding: '14px 24px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background 0.2s ease',
          marginBottom: '48px',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#2A2A2A'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#1A1A1A'; }}
      >
        <Sparkles className="h-5 w-5" />
        Create Assignment
      </button>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3"
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 500,
                background: isActive ? '#F3F4F6' : 'transparent',
                color: isActive ? '#1A1A1A' : '#6B7280',
                transition: 'background 0.15s ease',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#F9FAFB'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <Link
        href="/settings"
        className="flex items-center gap-3"
        style={{
          padding: '12px 16px',
          fontSize: '15px',
          color: '#6B7280',
          textDecoration: 'none',
          marginBottom: '24px',
        }}
      >
        <Settings className="h-5 w-5" />
        Settings
      </Link>

      {/* User Info */}
      <div
        className="flex items-center gap-3"
        style={{
          padding: '12px',
          borderRadius: '12px',
          background: '#F9FAFB',
        }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFE8E0' }}
        >
          <span className="text-lg font-bold" style={{ color: '#FF6B35' }}>
            {user?.name?.charAt(0) || 'U'}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A', lineHeight: 1.2 }} className="truncate">
            {user?.name || 'User'}
          </p>
          <p style={{ fontSize: '13px', color: '#9CA3AF' }} className="truncate capitalize">
            {user?.role || 'teacher'}
          </p>
        </div>
      </div>
    </aside>
  );
}
