'use client';

import { useRouter } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Plus, FileText, Search, X, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();

  return (
    <ProtectedRoute>
    <div className="min-h-screen" style={{ background: '#F5F5F7' }}>
      <TopNav />

      <div
        className="flex items-center justify-center"
        style={{ height: 'calc(100vh - 80px)', padding: '40px' }}
      >
        <div className="text-center" style={{ maxWidth: '540px' }}>
          {/* Illustration */}
          <div className="relative mx-auto" style={{ width: '280px', height: '280px', marginBottom: '40px' }}>
            {/* Document outline */}
            <div
              className="absolute"
              style={{
                width: '200px',
                height: '240px',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                top: '20px',
                left: '40px',
              }}
            />
            {/* Search circle */}
            <div
              className="absolute flex items-center justify-center"
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '8px solid #E5E7EB',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                top: '60px',
                left: '60px',
              }}
            >
              <X size={60} color="#FF4D4D" strokeWidth={2} />
            </div>
            {/* Decorative sparkle - top-left */}
            <Sparkles
              className="absolute"
              size={24}
              color="#6366F1"
              style={{ top: 0, left: '80px', transform: 'rotate(-15deg)' }}
            />
            {/* Decorative dots */}
            <div
              className="absolute rounded-full"
              style={{ width: '12px', height: '12px', background: '#9CA3AF', top: '30px', right: '80px' }}
            />
            <div
              className="absolute rounded-full"
              style={{ width: '8px', height: '8px', background: '#60A5FA', top: '52px', right: '60px' }}
            />
            {/* Decorative sparkle - bottom-right */}
            <Sparkles
              className="absolute"
              size={24}
              color="#6366F1"
              style={{ bottom: '10px', right: '40px', transform: 'rotate(15deg)' }}
            />
            <div
              className="absolute rounded-full"
              style={{ width: '10px', height: '10px', background: '#9CA3AF', bottom: '40px', right: '20px' }}
            />
          </div>

          {/* Heading */}
          <h1
            className="font-bold"
            style={{ fontSize: '24px', color: '#1A1A1A', marginBottom: '16px' }}
          >
            No assignments yet
          </h1>

          {/* Description */}
          <p
            className="text-base"
            style={{
              color: '#6B7280',
              lineHeight: '1.6',
              maxWidth: '480px',
              margin: '0 auto 32px',
              fontSize: '15px',
            }}
          >
            Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => router.push('/create')}
            style={{
              background: '#1A1A1A',
              color: '#FFFFFF',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2A2A2A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1A1A1A'; }}
          >
            <Plus className="h-5 w-5" />
            Create Your First Assignment
          </button>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
