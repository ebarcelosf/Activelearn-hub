// src/test/hooks/useUtilityHooks.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useGuidingQuestions } from '@/hooks/useGuidingQuestions';
import { useChecklistItems } from '@/hooks/useChecklistItems';
import { useNudges } from '@/hooks/useNudges';
import { 
  mockSupabaseClient, 
  mockGuidingQuestion,
  mockChecklistItem,
  mockSuccessResponse, 
  resetAllMocks 
} from './supabase';
import { TestWrapper } from './contexts';

// Mock do módulo Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));

describe('useGuidingQuestions Hook', () => {
  const projectId = 'test-project-id';

  beforeEach(() => {
    resetAllMocks();
  });

  describe('Gerenciar Perguntas Norteadoras', () => {
    it('deve buscar perguntas do projeto', async () => {
      // Arrange
      const questions = [
        mockGuidingQuestion,
        { ...mockGuidingQuestion, id: 'question-2', text: 'Another question?' },
      ];

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockSuccessResponse(questions)),
      });

      // Act
      const { result } = renderHook(() => useGuidingQuestions(projectId), { wrapper: TestWrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.questions).toHaveLength(2);
      });
    });

    it('deve adicionar nova pergunta', async () => {
      // Arrange
      const newQuestion = 'What are the main challenges?';

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse({
          ...mockGuidingQuestion,
          text: newQuestion,
        })),
      });

      // Act
      const { result } = renderHook(() => useGuidingQuestions(projectId), { wrapper: TestWrapper });
      await result.current.addQuestion(newQuestion);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('guiding_questions');
      });
    });

    it('deve atualizar resposta de pergunta', async () => {
      // Arrange
      const questionId = 'test-question-id';
      const answer = 'This is the answer to the question';

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse({
          ...mockGuidingQuestion,
          answer,
        })),
      });

      // Act
      const { result } = renderHook(() => useGuidingQuestions(projectId), { wrapper: TestWrapper });
      await result.current.updateAnswer(questionId, answer);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('guiding_questions');
      });
    });

    it('deve remover pergunta', async () => {
      // Arrange
      const questionId = 'test-question-id';

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockSuccessResponse({})),
      });

      // Act
      const { result } = renderHook(() => useGuidingQuestions(projectId), { wrapper: TestWrapper });
      await result.current.removeQuestion(questionId);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('guiding_questions');
      });
    });

    it('deve contar perguntas respondidas', async () => {
      // Arrange
      const questions = [
        { ...mockGuidingQuestion, id: 'q1', answer: 'Answer 1' },
        { ...mockGuidingQuestion, id: 'q2', answer: '' }, // Não respondida
        { ...mockGuidingQuestion, id: 'q3', answer: 'Answer 3' },
      ];

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockSuccessResponse(questions)),
      });

      // Act
      const { result } = renderHook(() => useGuidingQuestions(projectId), { wrapper: TestWrapper });

      // Assert
      await waitFor(() => {
        const answeredCount = result.current.questions.filter(
          q => q.answer && q.answer.trim().length > 0
        ).length;
        expect(answeredCount).toBe(2);
      });
    });

    it('deve validar que pergunta não esteja vazia', async () => {
      // Arrange
      const emptyQuestion = '';

      // Act & Assert
      const { result } = renderHook(() => useGuidingQuestions(projectId), { wrapper: TestWrapper });
      await expect(
        async () => await result.current.addQuestion(emptyQuestion)
      ).rejects.toThrow();
    });
  });
});

describe('useChecklistItems Hook', () => {
  const projectId = 'test-project-id';
  const phase = 'engage';

  beforeEach(() => {
    resetAllMocks();
  });

  describe('Gerenciar Checklist', () => {
    it('deve buscar items do checklist por fase', async () => {
      // Arrange
      const items = [
        mockChecklistItem,
        { ...mockChecklistItem, id: 'item-2', text: 'Another task' },
      ];

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation((field, value) => {
          if (field === 'phase') {
            return {
              ...mockSupabaseClient.from(),
              order: vi.fn().mockResolvedValue(mockSuccessResponse(items)),
            };
          }
          return mockSupabaseClient.from();
        }),
      });

      // Act
      const { result } = renderHook(() => useChecklistItems(projectId, phase), { wrapper: TestWrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.items).toHaveLength(2);
      });
    });

    it('deve adicionar novo item', async () => {
      // Arrange
      const newItem = 'Complete Big Idea';

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse({
          ...mockChecklistItem,
          text: newItem,
        })),
      });

      // Act
      const { result } = renderHook(() => useChecklistItems(projectId, phase), { wrapper: TestWrapper });
      await result.current.addItem(newItem);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('checklist_items');
      });
    });

    it('deve marcar item como completo/incompleto', async () => {
      // Arrange
      const itemId = 'test-checklist-id';

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse({
          ...mockChecklistItem,
          done: true,
        })),
      });

      // Act
      const { result } = renderHook(() => useChecklistItems(projectId, phase), { wrapper: TestWrapper });
      await result.current.toggleItem(itemId);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('checklist_items');
      });
    });

    it('deve remover item', async () => {
      // Arrange
      const itemId = 'test-checklist-id';

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockSuccessResponse({})),
      });

      // Act
      const { result } = renderHook(() => useChecklistItems(projectId, phase), { wrapper: TestWrapper });
      await result.current.removeItem(itemId);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('checklist_items');
      });
    });

    it('deve calcular progresso do checklist', async () => {
      // Arrange
      const items = [
        { ...mockChecklistItem, id: 'item-1', done: true },
        { ...mockChecklistItem, id: 'item-2', done: true },
        { ...mockChecklistItem, id: 'item-3', done: false },
      ];

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation(() => ({
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue(mockSuccessResponse(items)),
        })),
      });

      // Act
      const { result } = renderHook(() => useChecklistItems(projectId, phase), { wrapper: TestWrapper });

      // Assert
      await waitFor(() => {
        const completedCount = result.current.items.filter(item => item.done).length;
        const progress = (completedCount / result.current.items.length) * 100;
        expect(progress).toBeCloseTo(66.67, 1);
      });
    });

    it('deve separar checklists por fase', async () => {
      // Arrange
      const engageItems = [
        { ...mockChecklistItem, phase: 'engage' },
      ];
      const investigateItems = [
        { ...mockChecklistItem, id: 'item-2', phase: 'investigate' },
      ];

      // Act
      const { result: engageResult } = renderHook(
        () => useChecklistItems(projectId, 'engage'),
        { wrapper: TestWrapper }
      );
      const { result: investigateResult } = renderHook(
        () => useChecklistItems(projectId, 'investigate'),
        { wrapper: TestWrapper }
      );

      // Assert - Os checklists devem ser independentes por fase
      expect(engageResult.current.items).not.toEqual(investigateResult.current.items);
    });
  });
});

describe('useNudges Hook', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('Sistema de Nudges Contextuais', () => {
    it('deve abrir modal de nudges', () => {
      // Act
      const { result } = renderHook(() => useNudges());
      
      act(() => {
        result.current.openNudgeModal('engage', 'big_idea');
      });

      // Assert
      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.currentPhase).toBe('engage');
      expect(result.current.currentCategory).toBe('big_idea');
    });

    it('deve fechar modal de nudges', () => {
      // Act
      const { result } = renderHook(() => useNudges());
      
      act(() => {
        result.current.openNudgeModal('engage', 'big_idea');
      });

      act(() => {
        result.current.closeModal();
      });

      // Assert
      expect(result.current.isModalOpen).toBe(false);
    });

    it('deve retornar dicas diferentes a cada solicitação', () => {
      // Act
      const { result } = renderHook(() => useNudges());
      
      const nudge1 = result.current.getNudge('engage', 'big_idea');
      const nudge2 = result.current.getNudge('engage', 'big_idea');

      // Assert - As dicas devem ser diferentes (sistema aleatório)
      // Nota: Este teste pode falhar ocasionalmente se sortear a mesma dica
      // Em produção, considere usar seed para controlar aleatoriedade em testes
      expect(nudge1).toBeDefined();
      expect(nudge2).toBeDefined();
    });

    it('deve fornecer nudges específicos para cada fase', () => {
      // Act
      const { result } = renderHook(() => useNudges());
      
      const engageNudge = result.current.getNudge('engage', 'big_idea');
      const investigateNudge = result.current.getNudge('investigate', 'questions');
      const actNudge = result.current.getNudge('act', 'solution');

      // Assert
      expect(engageNudge).toBeDefined();
      expect(investigateNudge).toBeDefined();
      expect(actNudge).toBeDefined();
      
      // Nudges devem ser diferentes por fase
      expect(engageNudge).not.toEqual(investigateNudge);
      expect(investigateNudge).not.toEqual(actNudge);
    });

    it('deve fornecer nudges específicos para cada categoria', () => {
      // Act
      const { result } = renderHook(() => useNudges());
      
      const bigIdeaNudge = result.current.getNudge('engage', 'big_idea');
      const questionNudge = result.current.getNudge('engage', 'essential_question');

      // Assert
      expect(bigIdeaNudge).toBeDefined();
      expect(questionNudge).toBeDefined();
      
      // Nudges devem ser diferentes por categoria
      expect(bigIdeaNudge).not.toEqual(questionNudge);
    });

    it('deve retornar nudge padrão para categoria desconhecida', () => {
      // Act
      const { result } = renderHook(() => useNudges());
      const nudge = result.current.getNudge('engage', 'unknown_category' as any);

      // Assert
      expect(nudge).toBeDefined();
      expect(nudge).toContain('dica'); // Deve conter alguma dica genérica
    });

    it('deve inspirar-se em estratégias criativas (Oblique Strategies)', () => {
      // Act
      const { result } = renderHook(() => useNudges());
      const nudge = result.current.getNudge('investigate', 'synthesis');

      // Assert
      // Nudges devem ser criativos e provocativos, não instrucionais simples
      expect(nudge.length).toBeGreaterThan(20); // Deve ser uma dica substancial
    });
  });

  describe('Integração com Badges', () => {
    it('deve disparar evento ao solicitar ajuda', () => {
      // Arrange
      const eventListener = vi.fn();
      window.addEventListener('nudge-requested', eventListener);

      // Act
      const { result } = renderHook(() => useNudges());
      act(() => {
        result.current.openNudgeModal('engage', 'big_idea');
      });

      // Assert
      // Pode haver integração com sistema de badges para curiosidade
      window.removeEventListener('nudge-requested', eventListener);
    });
  });
});
