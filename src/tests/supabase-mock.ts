// src/test/mocks/supabase.ts
import { vi } from 'vitest';

// Mock do cliente Supabase
export const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    updateUser: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  },
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      download: vi.fn(),
      getPublicUrl: vi.fn(),
      remove: vi.fn(),
    })),
  },
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  })),
};

// Mock de dados de usuário
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {
    full_name: 'Test User',
    avatar_url: null,
    theme: 'light',
  },
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
};

// Mock de dados de projeto
export const mockProject = {
  id: 'test-project-id',
  user_id: 'test-user-id',
  title: 'Test Project',
  description: 'Test Description',
  phase: 'engage' as const,
  engage_completed: false,
  investigate_completed: false,
  act_completed: false,
  big_idea: '',
  essential_question: '',
  challenge: '',
  synthesis: null,
  solution: null,
  implementation: null,
  evaluation: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Mock de badges
export const mockBadges = [
  {
    id: 'explorer',
    name: 'Explorador',
    description: 'Criou seu primeiro projeto',
    category: 'project',
    xp: 50,
    icon: 'compass',
    earned: false,
  },
  {
    id: 'researcher',
    name: 'Pesquisador',
    description: 'Adicionou 3 recursos de pesquisa',
    category: 'research',
    xp: 75,
    icon: 'book',
    earned: false,
  },
];

// Mock de atividades
export const mockActivity = {
  id: 'test-activity-id',
  project_id: 'test-project-id',
  title: 'Test Activity',
  description: 'Test activity description',
  type: 'experiment',
  status: 'planned',
  notes: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Mock de recursos
export const mockResource = {
  id: 'test-resource-id',
  project_id: 'test-project-id',
  title: 'Test Resource',
  url: 'https://example.com/resource',
  type: 'article',
  credibility: 'high',
  notes: 'Test notes',
  tags: ['test', 'resource'],
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Mock de perguntas norteadoras
export const mockGuidingQuestion = {
  id: 'test-question-id',
  project_id: 'test-project-id',
  text: 'What is the main challenge?',
  answer: 'This is a test answer',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Mock de protótipos
export const mockPrototype = {
  id: 'test-prototype-id',
  project_id: 'test-project-id',
  title: 'Test Prototype',
  description: 'Test prototype description',
  fidelity: 'high',
  test_results: 'Positive results',
  next_steps: 'Continue development',
  files: [],
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Mock de checklist items
export const mockChecklistItem = {
  id: 'test-checklist-id',
  project_id: 'test-project-id',
  phase: 'engage',
  text: 'Complete Big Idea',
  done: false,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

// Helper para resetar todos os mocks
export const resetAllMocks = () => {
  vi.clearAllMocks();
};

// Helper para mockar resposta de sucesso
export const mockSuccessResponse = (data: any) => ({
  data,
  error: null,
});

// Helper para mockar resposta de erro
export const mockErrorResponse = (message: string) => ({
  data: null,
  error: { message },
});
