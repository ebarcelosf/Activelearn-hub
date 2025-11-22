// src/test/hooks/useDataManagement.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useActivities } from '@/hooks/useActivities';
import { useResources } from '@/hooks/useResources';
import { usePrototypes } from '@/hooks/usePrototypes';
import { 
  mockSupabaseClient, 
  mockActivity, 
  mockResource, 
  mockPrototype,
  mockSuccessResponse, 
  mockErrorResponse,
  resetAllMocks 
} from './supabase';
import { TestWrapper } from './contexts';

// Mock do módulo Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));

describe('useActivities Hook', () => {
  const projectId = 'test-project-id';

  beforeEach(() => {
    resetAllMocks();
  });

  describe('Gerenciar Atividades', () => {
    it('deve buscar atividades do projeto', async () => {
      // Arrange
      const activities = [mockActivity, { ...mockActivity, id: 'activity-2' }];

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockSuccessResponse(activities)),
      });

      // Act
      const { result } = renderHook(() => useActivities(projectId), { wrapper: TestWrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.activities).toHaveLength(2);
      });
    });

    it('deve adicionar nova atividade', async () => {
      // Arrange
      const newActivity = {
        title: 'New Activity',
        description: 'Description',
        type: 'experiment',
        status: 'planned',
      };

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse(newActivity)),
      });

      // Act
      const { result } = renderHook(() => useActivities(projectId), { wrapper: TestWrapper });
      await result.current.addActivity(newActivity);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('activities');
      });
    });

    it('deve atualizar status de atividade', async () => {
      // Arrange
      const activityId = 'test-activity-id';

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse({ ...mockActivity, status: 'completed' })),
      });

      // Act
      const { result } = renderHook(() => useActivities(projectId), { wrapper: TestWrapper });
      await result.current.toggleStatus(activityId);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('activities');
      });
    });

    it('deve remover atividade', async () => {
      // Arrange
      const activityId = 'test-activity-id';

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockSuccessResponse({})),
      });

      // Act
      const { result } = renderHook(() => useActivities(projectId), { wrapper: TestWrapper });
      await result.current.removeActivity(activityId);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('activities');
      });
    });

    it('deve validar tipos de atividade permitidos', async () => {
      // Arrange
      const invalidActivity = {
        title: 'Test',
        type: 'invalid-type', // Tipo inválido
      };

      // Act & Assert
      const { result } = renderHook(() => useActivities(projectId), { wrapper: TestWrapper });
      await expect(
        async () => await result.current.addActivity(invalidActivity as any)
      ).rejects.toThrow();
    });
  });
});

describe('useResources Hook', () => {
  const projectId = 'test-project-id';

  beforeEach(() => {
    resetAllMocks();
  });

  describe('Gerenciar Recursos', () => {
    it('deve buscar recursos do projeto', async () => {
      // Arrange
      const resources = [mockResource, { ...mockResource, id: 'resource-2' }];

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockSuccessResponse(resources)),
      });

      // Act
      const { result } = renderHook(() => useResources(projectId), { wrapper: TestWrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.resources).toHaveLength(2);
      });
    });

    it('deve adicionar novo recurso', async () => {
      // Arrange
      const newResource = {
        title: 'New Resource',
        url: 'https://example.com',
        type: 'article',
        credibility: 'high',
        tags: ['test'],
      };

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse(newResource)),
      });

      // Act
      const { result } = renderHook(() => useResources(projectId), { wrapper: TestWrapper });
      await result.current.addResource(newResource);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('resources');
      });
    });

    it('deve validar formato de URL', async () => {
      // Arrange
      const invalidResource = {
        title: 'Test',
        url: 'not-a-url', // URL inválida
        type: 'article',
      };

      // Act & Assert
      const { result } = renderHook(() => useResources(projectId), { wrapper: TestWrapper });
      await expect(
        async () => await result.current.addResource(invalidResource)
      ).rejects.toThrow();
    });

    it('deve validar níveis de credibilidade', async () => {
      // Arrange
      const resourceWithInvalidCredibility = {
        title: 'Test',
        url: 'https://example.com',
        type: 'article',
        credibility: 'invalid-level', // Nível inválido
      };

      // Act & Assert
      const { result } = renderHook(() => useResources(projectId), { wrapper: TestWrapper });
      await expect(
        async () => await result.current.addResource(resourceWithInvalidCredibility as any)
      ).rejects.toThrow();
    });

    it('deve atualizar recurso existente', async () => {
      // Arrange
      const resourceId = 'test-resource-id';
      const updates = { credibility: 'medium' };

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse({ ...mockResource, ...updates })),
      });

      // Act
      const { result } = renderHook(() => useResources(projectId), { wrapper: TestWrapper });
      await result.current.updateResource(resourceId, updates);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('resources');
      });
    });

    it('deve filtrar recursos por tags', async () => {
      // Arrange
      const resources = [
        { ...mockResource, tags: ['science', 'research'] },
        { ...mockResource, id: 'resource-2', tags: ['technology'] },
      ];

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockSuccessResponse(resources)),
      });

      // Act
      const { result } = renderHook(() => useResources(projectId), { wrapper: TestWrapper });

      // Assert
      await waitFor(() => {
        const scienceResources = result.current.resources.filter(
          r => r.tags.includes('science')
        );
        expect(scienceResources).toHaveLength(1);
      });
    });
  });
});

describe('usePrototypes Hook', () => {
  const projectId = 'test-project-id';

  beforeEach(() => {
    resetAllMocks();
  });

  describe('Gerenciar Protótipos', () => {
    it('deve buscar protótipos do projeto', async () => {
      // Arrange
      const prototypes = [mockPrototype, { ...mockPrototype, id: 'prototype-2' }];

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockSuccessResponse(prototypes)),
      });

      // Act
      const { result } = renderHook(() => usePrototypes(projectId), { wrapper: TestWrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.prototypes).toHaveLength(2);
      });
    });

    it('deve criar novo protótipo', async () => {
      // Arrange
      const newPrototype = {
        title: 'New Prototype',
        description: 'Description',
        fidelity: 'high',
        test_results: 'Positive',
        next_steps: 'Continue',
      };

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse(newPrototype)),
      });

      // Act
      const { result } = renderHook(() => usePrototypes(projectId), { wrapper: TestWrapper });
      await result.current.addPrototype(newPrototype);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('prototypes');
      });
    });

    it('deve validar níveis de fidelidade', async () => {
      // Arrange
      const invalidPrototype = {
        title: 'Test',
        fidelity: 'invalid-fidelity', // Fidelidade inválida
      };

      // Act & Assert
      const { result } = renderHook(() => usePrototypes(projectId), { wrapper: TestWrapper });
      await expect(
        async () => await result.current.addPrototype(invalidPrototype as any)
      ).rejects.toThrow();
    });

    it('deve atualizar protótipo existente', async () => {
      // Arrange
      const prototypeId = 'test-prototype-id';
      const updates = {
        test_results: 'Updated results',
        next_steps: 'New steps',
      };

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse({ ...mockPrototype, ...updates })),
      });

      // Act
      const { result } = renderHook(() => usePrototypes(projectId), { wrapper: TestWrapper });
      await result.current.updatePrototype(prototypeId, updates);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('prototypes');
      });
    });

    it('deve suportar upload de múltiplos arquivos', async () => {
      // Arrange
      const prototypeWithFiles = {
        ...mockPrototype,
        files: [
          { name: 'design.pdf', url: 'https://example.com/file1' },
          { name: 'mockup.png', url: 'https://example.com/file2' },
        ],
      };

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse(prototypeWithFiles)),
      });

      // Act
      const { result } = renderHook(() => usePrototypes(projectId), { wrapper: TestWrapper });
      await result.current.addPrototype(prototypeWithFiles);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('prototypes');
      });
    });

    it('deve deletar protótipo', async () => {
      // Arrange
      const prototypeId = 'test-prototype-id';

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockSuccessResponse({})),
      });

      // Act
      const { result } = renderHook(() => usePrototypes(projectId), { wrapper: TestWrapper });
      await result.current.deletePrototype(prototypeId);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('prototypes');
      });
    });
  });
});
