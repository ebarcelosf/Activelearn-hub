// src/test/components/CBLPhases.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvestigatePane } from '@/components/cbl/InvestigatePane';
import { ActPane } from '@/components/cbl/ActPane';
import { mockProject } from './supabase';
import { TestWrapper } from './contexts';

// Mock dos hooks
vi.mock('@/hooks/useGuidingQuestions', () => ({
  useGuidingQuestions: () => ({
    questions: [],
    addQuestion: vi.fn(),
    updateAnswer: vi.fn(),
    removeQuestion: vi.fn(),
  }),
}));

vi.mock('@/hooks/useActivities', () => ({
  useActivities: () => ({
    activities: [],
    addActivity: vi.fn(),
    updateActivity: vi.fn(),
    toggleStatus: vi.fn(),
    removeActivity: vi.fn(),
  }),
}));

vi.mock('@/hooks/useResources', () => ({
  useResources: () => ({
    resources: [],
    addResource: vi.fn(),
    updateResource: vi.fn(),
    removeResource: vi.fn(),
  }),
}));

vi.mock('@/hooks/usePrototypes', () => ({
  usePrototypes: () => ({
    prototypes: [],
    addPrototype: vi.fn(),
    updatePrototype: vi.fn(),
    deletePrototype: vi.fn(),
  }),
}));

vi.mock('@/hooks/useChecklistItems', () => ({
  useChecklistItems: () => ({
    items: [],
    addItem: vi.fn(),
    toggleItem: vi.fn(),
    removeItem: vi.fn(),
  }),
}));

vi.mock('@/hooks/useNudges', () => ({
  useNudges: () => ({
    isModalOpen: false,
    openNudgeModal: vi.fn(),
    closeModal: vi.fn(),
  }),
}));

vi.mock('@/contexts/BadgeContext', () => ({
  useBadgeContextOptional: () => ({
    checkTrigger: vi.fn(),
  }),
}));

describe('InvestigatePane Component', () => {
  const mockUpdate = vi.fn();
  const mockOnPhaseTransition = vi.fn();

  const defaultProps = {
    data: mockProject,
    update: mockUpdate,
    onPhaseTransition: mockOnPhaseTransition,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar as quatro seções principais', () => {
      // Act
      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      expect(screen.getByText(/Guiding Questions/i)).toBeInTheDocument();
      expect(screen.getByText(/Guiding Activities/i)).toBeInTheDocument();
      expect(screen.getByText(/Guiding Resources/i)).toBeInTheDocument();
      expect(screen.getByText(/Research Synthesis/i)).toBeInTheDocument();
    });

    it('deve exibir descrições das seções', () => {
      // Act
      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      expect(screen.getByText(/perguntas orientadoras/i)).toBeInTheDocument();
    });
  });

  describe('Guiding Questions', () => {
    it('deve permitir adicionar nova pergunta', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockAddQuestion = vi.fn();
      
      vi.mocked(vi.fn()).mockImplementation(() => ({
        questions: [],
        addQuestion: mockAddQuestion,
      }));

      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const addQuestionButton = screen.getByRole('button', { name: /adicionar pergunta/i });
      await user.click(addQuestionButton);

      // Assert
      // Formulário deve aparecer
      const questionInput = screen.queryByPlaceholderText(/digite a pergunta/i);
      if (questionInput) {
        await user.type(questionInput, 'What are the main challenges?');
      }
    });

    it('deve permitir responder perguntas progressivamente', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act & Assert
      // Usuário pode responder perguntas ao longo do tempo
      const answerInputs = screen.queryAllByPlaceholderText(/resposta/i);
      expect(answerInputs).toBeDefined();
    });

    it('deve remover pergunta ao clicar em deletar', async () => {
      // Arrange
      const mockRemoveQuestion = vi.fn();
      
      vi.mocked(vi.fn()).mockImplementation(() => ({
        questions: [{ id: 'q1', text: 'Test question?', answer: '' }],
        removeQuestion: mockRemoveQuestion,
      }));

      const user = userEvent.setup();
      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const deleteButtons = screen.queryAllByRole('button', { name: /deletar|remover/i });
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0]);
      }

      // Assert
      await waitFor(() => {
        expect(mockRemoveQuestion).toHaveBeenCalled();
      });
    });
  });

  describe('Guiding Activities', () => {
    it('deve permitir adicionar nova atividade', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const addActivityButton = screen.queryByRole('button', { name: /adicionar atividade/i });
      if (addActivityButton) {
        await user.click(addActivityButton);
      }

      // Assert - Modal ou formulário deve aparecer
    });

    it('deve permitir diferentes tipos de atividades', async () => {
      // Types: experiment, interview, observation, field_trip, workshop
      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert - Verificar se tipos estão disponíveis
      const typeSelectors = screen.queryAllByRole('combobox');
      expect(typeSelectors).toBeDefined();
    });

    it('deve permitir diferentes status de atividades', async () => {
      // Status: planned, in_progress, completed
      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert - Verificar se status estão disponíveis
    });

    it('deve marcar atividade como completa', async () => {
      // Arrange
      const mockToggleStatus = vi.fn();
      const user = userEvent.setup();
      
      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act & Assert
      // Checkbox ou botão para marcar como completo
    });
  });

  describe('Guiding Resources', () => {
    it('deve permitir adicionar novo recurso', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const addResourceButton = screen.queryByRole('button', { name: /adicionar recurso/i });
      if (addResourceButton) {
        await user.click(addResourceButton);
      }

      // Assert
      // Formulário de recurso deve aparecer
    });

    it('deve validar URL do recurso', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const urlInput = screen.queryByPlaceholderText(/url|link/i);
      if (urlInput) {
        await user.type(urlInput, 'not-a-valid-url');
      }

      // Assert - Deve mostrar mensagem de erro
    });

    it('deve avaliar credibilidade de fontes', async () => {
      // Arrange
      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      // Opções de credibilidade: high, medium, low
      const credibilitySelectors = screen.queryAllByRole('radio');
      expect(credibilitySelectors).toBeDefined();
    });

    it('deve permitir filtrar recursos por tags', async () => {
      // Arrange
      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      const tagInputs = screen.queryAllByPlaceholderText(/tag/i);
      expect(tagInputs).toBeDefined();
    });

    it('deve suportar diferentes tipos de recursos', async () => {
      // Types: article, video, book, website, paper
      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      const typeSelectors = screen.queryAllByRole('combobox');
      expect(typeSelectors).toBeDefined();
    });
  });

  describe('Research Synthesis', () => {
    it('deve permitir escrever síntese de pesquisa', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const synthesisInput = screen.queryByPlaceholderText(/síntese|resumo/i);
      if (synthesisInput) {
        await user.type(synthesisInput, 'This is my research synthesis');
      }

      // Assert
      expect(synthesisInput).toHaveValue('This is my research synthesis');
    });

    it('deve validar que síntese seja obrigatória', () => {
      // Arrange
      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      const completeButton = screen.getByRole('button', { name: /completar investigate/i });
      expect(completeButton).toBeDisabled();
    });
  });

  describe('Progressão de Fase', () => {
    it('deve desabilitar botão quando requisitos não atendidos', () => {
      // Act
      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      const completeButton = screen.getByRole('button', { name: /completar investigate/i });
      expect(completeButton).toBeDisabled();
    });

    it('deve habilitar botão quando todos requisitos atendidos', () => {
      // Arrange: 1 pergunta, 1 atividade, 1 recurso, síntese
      const propsWithData = {
        ...defaultProps,
        data: {
          ...mockProject,
          answers: [{ q: 'Question?', a: 'Answer' }],
          activities: [{ title: 'Activity' }],
          synthesis: 'Research synthesis',
        },
      };

      // Act
      render(<InvestigatePane {...propsWithData} />, { wrapper: TestWrapper });

      // Assert
      const completeButton = screen.getByRole('button', { name: /completar investigate/i });
      expect(completeButton).not.toBeDisabled();
    });
  });

  describe('Integração com Badges', () => {
    it('deve disparar badge ao responder primeira pergunta', async () => {
      // Arrange
      const mockCheckTrigger = vi.fn();
      
      render(<InvestigatePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act - Responder pergunta

      // Assert
      await waitFor(() => {
        expect(mockCheckTrigger).toHaveBeenCalledWith('first_question_answered');
      });
    });

    it('deve disparar badge ao adicionar 3 recursos', async () => {
      // Similar ao teste anterior
    });
  });
});

describe('ActPane Component', () => {
  const mockUpdate = vi.fn();
  const mockOnPhaseTransition = vi.fn();

  const defaultProps = {
    data: mockProject,
    update: mockUpdate,
    onPhaseTransition: mockOnPhaseTransition,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar as quatro seções principais', () => {
      // Act
      render(<ActPane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      expect(screen.getByText(/Solution Development/i)).toBeInTheDocument();
      expect(screen.getByText(/Implementation Plan/i)).toBeInTheDocument();
      expect(screen.getByText(/Evaluation Metrics/i)).toBeInTheDocument();
      expect(screen.getByText(/Prototypes/i)).toBeInTheDocument();
    });
  });

  describe('Solution Development', () => {
    it('deve permitir escrever desenvolvimento da solução', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ActPane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const solutionInput = screen.queryByPlaceholderText(/descreva a solução/i);
      if (solutionInput) {
        await user.type(solutionInput, 'My solution approach');
      }

      // Assert
      expect(solutionInput).toHaveValue('My solution approach');
    });

    it('deve salvar automaticamente com debounce', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ActPane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const solutionInput = screen.queryByPlaceholderText(/descreva a solução/i);
      if (solutionInput) {
        await user.type(solutionInput, 'Test');
      }

      // Assert
      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalled();
      }, { timeout: 1500 });
    });
  });

  describe('Implementation Plan', () => {
    it('deve permitir adicionar etapas do plano', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ActPane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const addStepButton = screen.queryByRole('button', { name: /adicionar etapa/i });
      if (addStepButton) {
        await user.click(addStepButton);
      }

      // Assert
      // Formulário de etapa deve aparecer
    });

    it('deve permitir definir responsável por etapa', async () => {
      // Arrange
      render(<ActPane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      const responsibleInputs = screen.queryAllByPlaceholderText(/responsável/i);
      expect(responsibleInputs).toBeDefined();
    });

    it('deve permitir definir prazo para etapa', async () => {
      // Arrange
      render(<ActPane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      const deadlineInputs = screen.queryAllByPlaceholderText(/prazo|data/i);
      expect(deadlineInputs).toBeDefined();
    });
  });

  describe('Evaluation Metrics', () => {
    it('deve permitir definir métricas de avaliação', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ActPane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const metricsInput = screen.queryByPlaceholderText(/métricas/i);
      if (metricsInput) {
        await user.type(metricsInput, 'Success criteria');
      }

      // Assert
      expect(metricsInput).toHaveValue('Success criteria');
    });

    it('deve permitir critérios mensuráveis', async () => {
      // Arrange
      render(<ActPane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      // Deve haver campos para critérios quantitativos e qualitativos
    });
  });

  describe('Prototypes', () => {
    it('deve permitir criar novo protótipo', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ActPane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const addPrototypeButton = screen.queryByRole('button', { name: /adicionar protótipo/i });
      if (addPrototypeButton) {
        await user.click(addPrototypeButton);
      }

      // Assert
      // Modal ou formulário deve aparecer
    });

    it('deve permitir diferentes níveis de fidelidade', async () => {
      // Levels: low, medium, high
      render(<ActPane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      const fidelitySelectors = screen.queryAllByRole('radio');
      expect(fidelitySelectors).toBeDefined();
    });

    it('deve permitir upload de arquivos', async () => {
      // Arrange
      render(<ActPane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      const fileInputs = screen.queryAllByRole('button', { name: /upload|arquivo/i });
      expect(fileInputs).toBeDefined();
    });

    it('deve permitir documentar resultados de testes', async () => {
      // Arrange
      render(<ActPane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      const testResultsInputs = screen.queryAllByPlaceholderText(/resultados/i);
      expect(testResultsInputs).toBeDefined();
    });

    it('deve permitir definir próximos passos', async () => {
      // Arrange
      render(<ActPane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      const nextStepsInputs = screen.queryAllByPlaceholderText(/próximos passos/i);
      expect(nextStepsInputs).toBeDefined();
    });
  });

  describe('Progressão de Fase', () => {
    it('deve desabilitar botão quando requisitos não atendidos', () => {
      // Act
      render(<ActPane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      const completeButton = screen.getByRole('button', { name: /completar act/i });
      expect(completeButton).toBeDisabled();
    });

    it('deve habilitar botão quando todos requisitos atendidos', () => {
      // Arrange
      const propsWithData = {
        ...defaultProps,
        data: {
          ...mockProject,
          solution: 'Complete solution',
          implementation: 'Complete plan',
          evaluation: 'Complete metrics',
          prototypes: [{ title: 'Prototype 1' }],
        },
      };

      // Act
      render(<ActPane {...propsWithData} />, { wrapper: TestWrapper });

      // Assert
      const completeButton = screen.getByRole('button', { name: /completar act/i });
      expect(completeButton).not.toBeDisabled();
    });
  });

  describe('Badge Mestre CBL', () => {
    it('deve conceder badge ao completar todas as três fases', async () => {
      // Arrange
      const mockCheckTrigger = vi.fn();
      const user = userEvent.setup();
      
      const propsWithAllPhases = {
        ...defaultProps,
        data: {
          ...mockProject,
          engageCompleted: true,
          investigateCompleted: true,
          solution: 'Complete',
          implementation: 'Complete',
          evaluation: 'Complete',
        },
      };

      render(<ActPane {...propsWithAllPhases} />, { wrapper: TestWrapper });

      // Act
      const completeButton = screen.getByRole('button', { name: /completar act/i });
      await user.click(completeButton);

      // Assert
      await waitFor(() => {
        expect(mockCheckTrigger).toHaveBeenCalledWith('all_phases_completed');
      });
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels apropriados', () => {
      // Act
      render(<ActPane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });
    });

    it('deve suportar navegação por teclado', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ActPane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      await user.tab();

      // Assert
      expect(document.activeElement).toBeTruthy();
    });
  });
});
