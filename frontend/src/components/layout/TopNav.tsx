'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, LayoutGrid, Bell, ChevronDown, User, Settings, LogOut, X } from 'lucide-react';

export default function TopNav({ title }: { title?: string }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div
      className="flex items-center justify-between"
      style={{
        height: '80px',
        padding: '0 40px',
        background: '#FFFFFF',
        borderRadius: '0 0 24px 24px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft className="h-6 w-6" style={{ color: '#1A1A1A' }} />
        </button>
        <Link href="/assessments" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
          <LayoutGrid className="h-5 w-5" style={{ color: '#6B7280' }} />
          <span style={{ fontSize: '18px', color: '#6B7280' }}>Assignment</span>
        </Link>
        {title && (
          <>
            <span style={{ color: '#6B7280' }}>/</span>
            <span style={{ fontSize: '18px', color: '#1A1A1A' }}>{title}</span>
          </>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, position: 'relative' }}
          >
            <Bell className="h-6 w-6" style={{ color: '#1A1A1A' }} />
            <div
              className="absolute -top-0.5 -right-0.5 rounded-full"
              style={{ width: '8px', height: '8px', background: '#FF4D4D' }}
            />
          </button>
          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-2 rounded-xl bg-white shadow-lg overflow-hidden"
              style={{ width: '280px', border: '1px solid #F3F4F6', zIndex: 50 }}
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>Notifications</p>
              </div>
              <div className="p-8 text-center">
                <p className="text-sm" style={{ color: '#9CA3AF' }}>No new notifications</p>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-3"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div
              className="flex items-center justify-center overflow-hidden rounded-full"
              style={{ width: '40px', height: '40px', background: '#F3F4F6' }}
            >
              <span className="text-sm font-medium" style={{ color: '#6B7280' }}>
                {user?.name?.charAt(0) || 'J'}
              </span>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A' }}>
              {user?.name || 'John Doe'}
            </span>
            <ChevronDown className="h-4 w-4" style={{ color: '#6B7280' }} />
          </button>
          {profileOpen && (
            <div
              className="absolute right-0 top-full mt-2 rounded-xl bg-white shadow-lg overflow-hidden"
              style={{ width: '200px', border: '1px solid #F3F4F6', zIndex: 50 }}
            >
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50"
                style={{ color: '#1A1A1A', textDecoration: 'none' }}
                onClick={() => setProfileOpen(false)}
              >
                <User className="h-4 w-4" style={{ color: '#6B7280' }} /> Profile
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50"
                style={{ color: '#1A1A1A', textDecoration: 'none' }}
                onClick={() => setProfileOpen(false)}
              >
                <Settings className="h-4 w-4" style={{ color: '#6B7280' }} /> Settings
              </Link>
              <hr style={{ border: 'none', borderTop: '1px solid #F3F4F6', margin: 0 }} />
              <button
                onClick={() => { logout(); setProfileOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 text-left"
                style={{ color: '#FF4D4D', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
