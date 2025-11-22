// src/test/hooks/useProjects.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProjects } from '@/hooks/useProjects';
import { mockSupabaseClient, mockProject, mockSuccessResponse, mockErrorResponse, resetAllMocks } from './supabase';
import { TestWrapper } from './contexts';

// Mock do módulo Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));

// Mock do useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

describe('useProjects Hook', () => {
  beforeEach(() => {
    resetAllMocks();
    
    // Setup default mock responses
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(mockSuccessResponse(mockProject)),
    });
    
    mockSupabaseClient.from = mockFrom;
  });

  describe('Buscar Projetos', () => {
    it('deve buscar todos os projetos do usuário', async () => {
      // Arrange
      const projects = [
        { ...mockProject, id: 'project-1', title: 'Project 1' },
        { ...mockProject, id: 'project-2', title: 'Project 2' },
      ];

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockSuccessResponse(projects)),
      });

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.projects).toHaveLength(2);
        expect(result.current.projects[0].title).toBe('Project 1');
      });
    });

    it('deve ordenar projetos por data de atualização', async () => {
      // Arrange
      const projects = [
        { ...mockProject, id: 'project-1', updated_at: '2024-01-02' },
        { ...mockProject, id: 'project-2', updated_at: '2024-01-01' },
      ];

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockSuccessResponse(projects)),
      });

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.projects[0].updated_at).toBe('2024-01-02');
      });
    });
  });

  describe('Criar Projeto', () => {
    it('deve criar novo projeto CBL', async () => {
      // Arrange
      const newProject = {
        title: 'New CBL Project',
        description: 'Test description',
      };

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse({
          ...mockProject,
          ...newProject,
        })),
      });

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });
      await result.current.createProject(newProject);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('projects');
      });
    });

    it('deve validar campos obrigatórios ao criar projeto', async () => {
      // Arrange
      const invalidProject = {
        title: '', // Título vazio
        description: 'Test',
      };

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });
      
      // Assert
      await expect(
        async () => await result.current.createProject(invalidProject)
      ).rejects.toThrow();
    });

    it('deve inicializar projeto na fase Engage', async () => {
      // Arrange
      const newProject = {
        title: 'New Project',
        description: 'Description',
      };

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse({
          ...mockProject,
          ...newProject,
          phase: 'engage',
        })),
      });

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });
      const created = await result.current.createProject(newProject);

      // Assert
      await waitFor(() => {
        expect(created.phase).toBe('engage');
      });
    });
  });

  describe('Atualizar Projeto', () => {
    it('deve atualizar campos do projeto', async () => {
      // Arrange
      const projectId = 'test-project-id';
      const updates = {
        title: 'Updated Title',
        big_idea: 'New big idea',
      };

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse({
          ...mockProject,
          ...updates,
        })),
      });

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });
      await result.current.updateProject(projectId, updates);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('projects');
      });
    });

    it('deve atualizar campo updated_at automaticamente', async () => {
      // Arrange
      const projectId = 'test-project-id';
      const updates = { title: 'Updated' };

      const mockUpdate = vi.fn().mockReturnThis();
      mockSupabaseClient.from = vi.fn().mockReturnValue({
        update: mockUpdate,
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse(mockProject)),
      });

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });
      await result.current.updateProject(projectId, updates);

      // Assert
      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            ...updates,
            updated_at: expect.any(String),
          })
        );
      });
    });
  });

  describe('Excluir Projeto', () => {
    it('deve excluir projeto existente', async () => {
      // Arrange
      const projectId = 'test-project-id';

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockSuccessResponse({})),
      });

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });
      await result.current.deleteProject(projectId);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('projects');
      });
    });

    it('deve remover projeto da lista local após exclusão', async () => {
      // Arrange
      const projectId = 'test-project-id';

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockSuccessResponse({})),
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockSuccessResponse([
          { ...mockProject, id: 'other-project' },
        ])),
      });

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });
      await result.current.deleteProject(projectId);

      // Assert
      await waitFor(() => {
        expect(result.current.projects.find(p => p.id === projectId)).toBeUndefined();
      });
    });
  });

  describe('Duplicar Projeto', () => {
    it('deve duplicar projeto mantendo dados relevantes', async () => {
      // Arrange
      const originalProject = {
        ...mockProject,
        title: 'Original Project',
        big_idea: 'Original idea',
        engage_completed: true,
      };

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse(originalProject)),
        insert: vi.fn().mockReturnThis(),
      });

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });
      await result.current.duplicateProject(originalProject.id);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('projects');
      });
    });

    it('deve resetar status de completude ao duplicar', async () => {
      // Arrange
      const originalProject = {
        ...mockProject,
        engage_completed: true,
        investigate_completed: true,
        act_completed: true,
      };

      const mockInsert = vi.fn().mockReturnThis();
      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse(originalProject)),
        insert: mockInsert,
      });

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });
      await result.current.duplicateProject(originalProject.id);

      // Assert
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            engage_completed: false,
            investigate_completed: false,
            act_completed: false,
          })
        );
      });
    });

    it('deve adicionar sufixo "(Cópia)" ao título', async () => {
      // Arrange
      const originalProject = {
        ...mockProject,
        title: 'Original Project',
      };

      const mockInsert = vi.fn().mockReturnThis();
      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse(originalProject)),
        insert: mockInsert,
      });

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });
      await result.current.duplicateProject(originalProject.id);

      // Assert
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Original Project (Cópia)',
          })
        );
      });
    });
  });

  describe('Cálculo de Progresso', () => {
    it('deve calcular 0% quando nenhuma fase está completa', () => {
      // Arrange
      const project = {
        ...mockProject,
        engage_completed: false,
        investigate_completed: false,
        act_completed: false,
      };

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });
      const progress = result.current.getProjectProgress(project);

      // Assert
      expect(progress).toBe(0);
    });

    it('deve calcular 33% quando apenas Engage está completo', () => {
      // Arrange
      const project = {
        ...mockProject,
        engage_completed: true,
        investigate_completed: false,
        act_completed: false,
      };

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });
      const progress = result.current.getProjectProgress(project);

      // Assert
      expect(progress).toBeCloseTo(33.33, 1);
    });

    it('deve calcular 67% quando Engage e Investigate estão completos', () => {
      // Arrange
      const project = {
        ...mockProject,
        engage_completed: true,
        investigate_completed: true,
        act_completed: false,
      };

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });
      const progress = result.current.getProjectProgress(project);

      // Assert
      expect(progress).toBeCloseTo(66.67, 1);
    });

    it('deve calcular 100% quando todas as fases estão completas', () => {
      // Arrange
      const project = {
        ...mockProject,
        engage_completed: true,
        investigate_completed: true,
        act_completed: true,
      };

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });
      const progress = result.current.getProjectProgress(project);

      // Assert
      expect(progress).toBe(100);
    });
  });

  describe('Cache e Sincronização', () => {
    it('deve usar cache para requisições subsequentes', async () => {
      // Arrange
      const projects = [mockProject];

      const mockOrder = vi.fn().mockResolvedValue(mockSuccessResponse(projects));
      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: mockOrder,
      });

      // Act
      const { result, rerender } = renderHook(() => useProjects(), { wrapper: TestWrapper });
      
      await waitFor(() => {
        expect(result.current.projects).toHaveLength(1);
      });

      rerender();

      // Assert - Deve usar cache na segunda renderização
      expect(mockOrder).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve lidar com erro ao buscar projetos', async () => {
      // Arrange
      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockErrorResponse('Database error')),
      });

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.projects).toEqual([]);
      });
    });

    it('deve lidar com erro ao criar projeto', async () => {
      // Arrange
      mockSupabaseClient.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockErrorResponse('Insert failed')),
      });

      // Act
      const { result } = renderHook(() => useProjects(), { wrapper: TestWrapper });
      
      // Assert
      await expect(
        async () => await result.current.createProject({ title: 'Test', description: 'Test' })
      ).rejects.toThrow();
    });
  });
});
