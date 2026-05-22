const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  createAssignment: (data: FormData) =>
    fetch(`${BASE_URL}/assignments`, { method: 'POST', body: data }).then(r => r.json()),

  getAssignments: () =>
    fetchApi<import('@/types').Assignment[]>('/assignments'),

  getAssignment: (id: string) =>
    fetchApi<import('@/types').Assignment>(`/assignments/${id}`),

  deleteAssignment: (id: string) =>
    fetchApi<{ message: string }>(`/assignments/${id}`, { method: 'DELETE' }),

  getAssessment: (assignmentId: string) =>
    fetchApi<import('@/types').Assessment>(`/assessments/${assignmentId}`),

  regenerateAssessment: (assignmentId: string) =>
    fetchApi<{ assignmentId: string; jobId: string; status: string }>(
      `/assessments/${assignmentId}/regenerate`,
      { method: 'POST' }
    ),

  getPdfUrl: (assessmentId: string) =>
    `${BASE_URL}/assessments/${assessmentId}/pdf`,
};
