const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('vedaai_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { ...getHeaders(), ...options?.headers as Record<string, string> },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('vedaai_token');
      localStorage.removeItem('vedaai_user');
      window.location.href = '/login';
    }
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  createAssignment: (data: FormData) =>
    fetch(`${BASE_URL}/assignments`, {
      method: 'POST',
      headers: typeof window !== 'undefined' && localStorage.getItem('vedaai_token')
        ? { 'Authorization': `Bearer ${localStorage.getItem('vedaai_token')}` } as any : {},
      body: data,
    }).then(r => r.json()),

  getAssignments: () =>
    fetchApi<{ data: import('@/types').Assignment[]; total: number; page: number; pages: number }>('/assignments'),

  getAssignment: (id: string) =>
    fetchApi<import('@/types').Assignment>(`/assignments/${id}`),

  deleteAssignment: (id: string) =>
    fetchApi<{ message: string }>(`/assignments/${id}`, { method: 'DELETE' }),

  getAssessment: (assignmentId: string) =>
    fetchApi<import('@/types').Assessment>(`/assessments/${assignmentId}`),

  regenerateAssessment: (assignmentId: string) =>
    fetchApi<{ assignmentId: string; jobId: string; status: string }>(
      `/assessments/${assignmentId}/regenerate`, { method: 'POST' }
    ),

  getPdfUrl: (assessmentId: string) =>
    `${BASE_URL}/assessments/${assessmentId}/pdf`,

  register: (data: { name: string; email: string; password: string; schoolName?: string; schoolLocation?: string }) =>
    fetchApi<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    fetchApi<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getMe: () =>
    fetchApi<any>('/auth/me'),

  getTemplates: () =>
    fetchApi<any[]>('/templates'),

  createTemplate: (data: any) =>
    fetchApi<any>('/templates', { method: 'POST', body: JSON.stringify(data) }),

  deleteTemplate: (id: string) =>
    fetchApi<{ message: string }>(`/templates/${id}`, { method: 'DELETE' }),

  getQuestionBank: (params?: string) =>
    fetchApi<any[]>(`/question-bank${params ? `?${params}` : ''}`),

  saveQuestion: (data: any) =>
    fetchApi<any>('/question-bank', { method: 'POST', body: JSON.stringify(data) }),

  deleteQuestion: (id: string) =>
    fetchApi<{ message: string }>(`/question-bank/${id}`, { method: 'DELETE' }),

  submitAnswers: (data: { assessmentId: string; answers: { questionNumber: number; text: string }[] }) =>
    fetchApi<any>('/submissions', { method: 'POST', body: JSON.stringify(data) }),

  getMySubmissions: () =>
    fetchApi<any[]>('/submissions/mine'),

  getSubmissionsForAssessment: (id: string) =>
    fetchApi<any[]>(`/submissions/${id}`),

  createShareLink: (assessmentId: string) =>
    fetchApi<{ code: string; url: string }>('/share', { method: 'POST', body: JSON.stringify({ assessmentId }) }),
};
