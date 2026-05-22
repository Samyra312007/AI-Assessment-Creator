'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', schoolName: '', schoolLocation: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e6e6e6] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-lg">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#2f2f2f]">
            <span className="text-white text-lg font-bold">V</span>
          </div>
          <h1 className="text-[28px] font-bold text-[#2f2f2f]">VedaAI</h1>
        </div>
        <h2 className="text-2xl font-bold text-[#2f2f2f] mb-1">Create account</h2>
        <p className="text-sm text-[#5d5d5d] mb-8">Register your school or yourself</p>

        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-2xl mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-[#5d5d5d] mb-1 block">Full Name</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
              className="w-full h-11 px-4 rounded-[100px] border border-[#dadada] text-sm outline-none focus:border-[#2f2f2f]" placeholder="John Doe" />
          </div>
          <div>
            <label className="text-sm text-[#5d5d5d] mb-1 block">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
              className="w-full h-11 px-4 rounded-[100px] border border-[#dadada] text-sm outline-none focus:border-[#2f2f2f]" placeholder="teacher@school.com" />
          </div>
          <div>
            <label className="text-sm text-[#5d5d5d] mb-1 block">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6}
              className="w-full h-11 px-4 rounded-[100px] border border-[#dadada] text-sm outline-none focus:border-[#2f2f2f]" placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="text-sm text-[#5d5d5d] mb-1 block">School Name (optional)</label>
            <input type="text" value={form.schoolName} onChange={e => setForm({...form, schoolName: e.target.value})}
              className="w-full h-11 px-4 rounded-[100px] border border-[#dadada] text-sm outline-none focus:border-[#2f2f2f]" placeholder="Delhi Public School" />
          </div>
          <div>
            <label className="text-sm text-[#5d5d5d] mb-1 block">School Location (optional)</label>
            <input type="text" value={form.schoolLocation} onChange={e => setForm({...form, schoolLocation: e.target.value})}
              className="w-full h-11 px-4 rounded-[100px] border border-[#dadada] text-sm outline-none focus:border-[#2f2f2f]" placeholder="Bokaro Steel City" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 rounded-[48px] bg-[#171717] text-white hover:bg-[#2f2f2f]">
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-sm text-[#5d5d5d] mt-6 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-[#171717] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
