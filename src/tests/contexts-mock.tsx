// src/test/mocks/contexts.tsx
import React from 'react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock do AuthContext
export const mockAuthContext = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    xp: 0,
    level: 1,
    theme: 'light',
  },
  loading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
};

// Mock do ProjectContext
export const mockProjectContext = {
  currentProject: null,
  projects: [],
  loading: false,
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  duplicateProject: vi.fn(),
  setCurrentProject: vi.fn(),
  getProjectProgress: vi.fn(() => 0),
};

// Mock do BadgeContext
export const mockBadgeContext = {
  badges: [],
  userBadges: [],
  loading: false,
  checkTrigger: vi.fn(),
  getTotalXP: vi.fn(() => 0),
  getCurrentLevel: vi.fn(() => 1),
  getProgressToNextLevel: vi.fn(() => ({ current: 0, required: 100, percentage: 0 })),
};

// Provider de teste para React Query
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Wrapper com providers para testes
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Mock do useAuth hook
export const mockUseAuth = () => mockAuthContext;

// Mock do useProjects hook
export const mockUseProjects = () => mockProjectContext;

// Mock do useBadges hook
export const mockUseBadges = () => mockBadgeContext;

// Helper para criar wrapper com mocks customizados
export const createWrapper = (overrides?: {
  auth?: Partial<typeof mockAuthContext>;
  project?: Partial<typeof mockProjectContext>;
  badge?: Partial<typeof mockBadgeContext>;
}) => {
  const queryClient = createTestQueryClient();

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
