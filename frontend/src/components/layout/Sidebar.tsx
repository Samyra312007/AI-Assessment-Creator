'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Plus,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/create', label: 'Create Assignment', icon: Plus },
  { href: '/assessments', label: 'My Assessments', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[304px] bg-white flex flex-col overflow-hidden" style={{ boxShadow: '0px 16px 48px rgba(0,0,0,0.12)', borderRadius: '0 16px 16px 0' }}>
      <div className="flex items-center gap-3 px-6 pt-8 pb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#2f2f2f]">
          <span className="text-white text-lg font-bold leading-none">V</span>
        </div>
        <h1 className="text-[28px] font-bold text-[#2f2f2f]" style={{ fontFamily: 'Bricolage Grotesque' }}>VedaAI</h1>
      </div>

      <div className="px-5">
        <Link
          href="/create"
          className="flex items-center justify-center gap-2 h-[42px] w-full rounded-[100px] bg-[#262626] text-white text-base font-medium"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <Plus className="h-4 w-4" />
          Create Assignment
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-3 py-3 rounded-lg text-base transition-colors',
                isActive
                  ? 'bg-[#efefef] text-[#2f2f2f] font-medium'
                  : 'text-[#5d5d5d] font-normal opacity-80 hover:opacity-100'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive ? 'text-[#2f2f2f]' : 'text-[#5d5d5d]')} />
              {item.label}
              {item.label === 'My Assessments' && (
                <span className="ml-auto inline-flex items-center justify-center h-6 px-2 rounded-[48px] bg-[#ff5623] text-white text-sm font-semibold leading-none">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-6">
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#efefef]">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#2f2f2f] text-white text-sm font-bold">
            D
          </div>
          <div>
            <p className="text-base font-bold text-[#2f2f2f] leading-tight">Delhi Public School</p>
            <p className="text-sm text-[#5d5d5d]" style={{ fontFamily: 'Bricolage Grotesque' }}>Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
