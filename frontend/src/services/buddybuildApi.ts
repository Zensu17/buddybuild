const API_BASE = '/buddybuild';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();
  if (!response.ok && !('success' in data)) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data as T;
}

export interface StudyQuote {
  text: string;
  author: string;
}

export interface StudyTip {
  id: string;
  text: string;
  category: 'productivity' | 'learning' | 'wellness' | 'memory';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'akademik' | 'event' | 'darurat' | 'tips';
  date: string;
  author: string;
}

export interface StudyLog {
  id: string;
  course: string;
  minutes: number;
  date: string;
}

export interface Habit {
  id: string;
  title: string;
  completed: boolean;
}

export interface ApiSuccess<T> {
  success: boolean;
  data: T;
}

export interface StudyBuddyResponse {
  success: boolean;
  reply?: string;
  tokens?: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
  };
  error?: string;
  code?: string;
}

export interface FlashcardGenerateResponse {
  success: boolean;
  count?: number;
  data?: {
    title: string;
    course: string;
    cards: { front: string; back: string }[];
  };
  error?: string;
}

export const buddybuildApi = {
  health: () => request<{ success: boolean; status: string }>('/health'),

  features: () => request<{ success: boolean; features: Record<string, string> }>('/features'),

  studyBuddy: (prompt: string, context?: string) =>
    request<StudyBuddyResponse>('/study-buddy', {
      method: 'POST',
      body: JSON.stringify({ prompt, context }),
    }),

  generateFlashcards: (topic: string, course: string) =>
    request<FlashcardGenerateResponse>('/flashcards/generate', {
      method: 'POST',
      body: JSON.stringify({ topic, course }),
    }),

  getStudyTips: () => request<ApiSuccess<StudyTip[]>>('/study-tips'),

  getQuotes: () => request<ApiSuccess<StudyQuote[]>>('/quotes'),

  getAnnouncements: () => request<ApiSuccess<Announcement[]>>('/announcements'),

  createAnnouncement: (payload: Omit<Announcement, 'id' | 'date'>) =>
    request<ApiSuccess<Announcement>>('/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteAnnouncement: (id: string) =>
    request<{ success: boolean }>(`/announcements/${id}`, { method: 'DELETE' }),

  getStudyLogs: () => request<ApiSuccess<StudyLog[]>>('/study-logs'),

  createStudyLog: (course: string, minutes: number) =>
    request<ApiSuccess<StudyLog>>('/study-logs', {
      method: 'POST',
      body: JSON.stringify({ course, minutes }),
    }),

  deleteStudyLog: (id: string) =>
    request<{ success: boolean }>(`/study-logs/${id}`, { method: 'DELETE' }),

  getHabits: () => request<ApiSuccess<Habit[]>>('/habits'),

  updateHabits: (habits: Habit[]) =>
    request<ApiSuccess<Habit[]>>('/habits', {
      method: 'PUT',
      body: JSON.stringify({ habits }),
    }),

  getNotes: () => request<ApiSuccess<{ content: string }>>('/notes'),

  updateNotes: (content: string) =>
    request<ApiSuccess<{ content: string }>>('/notes', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),
};
