'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard, FileText, Plus, BookOpen, ClipboardList, BarChart3, LogOut, Layers, Users,
} from 'lucide-react';
export default function Sidebar() {
  const pathname = usePathname();
  const { user, isTeacher, logout } = useAuth();

  const teacherNav = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/create', label: 'Create Assignment', icon: Plus },
    { href: '/assessments', label: 'My Assessments', icon: FileText },
    { href: '/question-bank', label: 'Question Bank', icon: BookOpen },
    { href: '/templates', label: 'Templates', icon: Layers },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/bulk-import', label: 'Bulk Import', icon: Users },
  ];

  const studentNav = [
    { href: '/student', label: 'My Assignments', icon: ClipboardList },
    { href: '/student/results', label: 'My Results', icon: BarChart3 },
  ];

  const navItems = isTeacher ? teacherNav : studentNav;

  if (!user) return null;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[304px] bg-white flex flex-col overflow-hidden" style={{ boxShadow: '0px 16px 48px rgba(0,0,0,0.12)', borderRadius: '0 16px 16px 0' }}>
      <div className="flex items-center gap-3 px-6 pt-8 pb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#2f2f2f]">
          <span className="text-white text-lg font-bold leading-none">V</span>
        </div>
        <h1 className="text-[28px] font-bold text-[#2f2f2f]">VedaAI</h1>
      </div>

      {isTeacher && (
        <div className="px-5">
          <Link href="/create" className="flex items-center justify-center gap-2 h-[42px] w-full rounded-[100px] bg-[#262626] text-white text-base font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
            <Plus className="h-4 w-4" /> Create Assignment
          </Link>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={cn(
              'flex items-center gap-2 px-3 py-3 rounded-lg text-base transition-colors',
              isActive ? 'bg-[#efefef] text-[#2f2f2f] font-medium' : 'text-[#5d5d5d] font-normal opacity-80 hover:opacity-100'
            )}>
              <Icon className={cn('h-5 w-5', isActive ? 'text-[#2f2f2f]' : 'text-[#5d5d5d]')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-4 border-t border-[#efefef] pt-4">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#efefef] mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#2f2f2f] text-white text-sm font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#2f2f2f] leading-tight truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-[#5d5d5d] capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm text-[#5d5d5d] hover:bg-[#efefef] transition-colors">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
