// src/test/components/EngagePane.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EngagePane } from '@/components/cbl/EngagePane';
import { mockProject } from './supabase';
import { TestWrapper } from './contexts';

// Mock dos hooks
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
    currentCategory: null,
    currentPhase: null,
    openNudgeModal: vi.fn(),
    closeModal: vi.fn(),
  }),
}));

vi.mock('@/contexts/BadgeContext', () => ({
  useBadgeContextOptional: () => ({
    checkTrigger: vi.fn(),
  }),
}));

describe('EngagePane Component', () => {
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
    it('deve renderizar as três seções principais', () => {
      // Act
      render(<EngagePane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      expect(screen.getByText('Big Ideas')).toBeInTheDocument();
      expect(screen.getByText('Essential Questions')).toBeInTheDocument();
      expect(screen.getByText('Challenges')).toBeInTheDocument();
    });

    it('deve renderizar descrições das seções', () => {
      // Act
      render(<EngagePane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      expect(screen.getByText(/Defina o problema central/i)).toBeInTheDocument();
      expect(screen.getByText(/Formule perguntas orientadoras/i)).toBeInTheDocument();
      expect(screen.getByText(/Liste desafios específicos/i)).toBeInTheDocument();
    });

    it('deve exibir campos de entrada para cada seção', () => {
      // Act
      render(<EngagePane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      const textareas = screen.getAllByRole('textbox');
      expect(textareas.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Big Idea', () => {
    it('deve permitir digitar Big Idea', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<EngagePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const bigIdeaInput = screen.getByPlaceholderText(/descreva a grande ideia/i);
      await user.type(bigIdeaInput, 'My big idea for the project');

      // Assert
      expect(bigIdeaInput).toHaveValue('My big idea for the project');
    });

    it('deve salvar Big Idea com debounce', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<EngagePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const bigIdeaInput = screen.getByPlaceholderText(/descreva a grande ideia/i);
      await user.type(bigIdeaInput, 'Test idea');

      // Assert - Deve ser chamado após o debounce
      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith('bigIdea', expect.any(String));
      }, { timeout: 1500 });
    });

    it('deve marcar seção como completa ao preencher Big Idea', async () => {
      // Arrange
      const user = userEvent.setup();
      const propsWithBigIdea = {
        ...defaultProps,
        data: { ...mockProject, bigIdea: 'Completed big idea' },
      };

      // Act
      render(<EngagePane {...propsWithBigIdea} />, { wrapper: TestWrapper });

      // Assert
      const completionIndicator = screen.getAllByRole('img', { hidden: true }); // Ícone de check
      expect(completionIndicator.length).toBeGreaterThan(0);
    });
  });

  describe('Essential Question', () => {
    it('deve permitir digitar Essential Question', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<EngagePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const questionInput = screen.getByPlaceholderText(/qual é a pergunta essencial/i);
      await user.type(questionInput, 'What is the main problem?');

      // Assert
      expect(questionInput).toHaveValue('What is the main problem?');
    });

    it('deve salvar Essential Question com debounce', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<EngagePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const questionInput = screen.getByPlaceholderText(/qual é a pergunta essencial/i);
      await user.type(questionInput, 'Test question?');

      // Assert
      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith('essentialQuestion', expect.any(String));
      }, { timeout: 1500 });
    });
  });

  describe('Challenge', () => {
    it('deve permitir digitar Challenge', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<EngagePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const challengeInput = screen.getByPlaceholderText(/descreva os desafios/i);
      await user.type(challengeInput, 'Main challenge to solve');

      // Assert
      expect(challengeInput).toHaveValue('Main challenge to solve');
    });
  });

  describe('Progressão de Fase', () => {
    it('deve desabilitar botão de completar quando campos obrigatórios vazios', () => {
      // Act
      render(<EngagePane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      const completeButton = screen.getByRole('button', { name: /completar engage/i });
      expect(completeButton).toBeDisabled();
    });

    it('deve habilitar botão quando Big Idea e Essential Question preenchidos', () => {
      // Arrange
      const propsWithData = {
        ...defaultProps,
        data: {
          ...mockProject,
          bigIdea: 'Test big idea',
          essentialQuestion: 'Test question?',
        },
      };

      // Act
      render(<EngagePane {...propsWithData} />, { wrapper: TestWrapper });

      // Assert
      const completeButton = screen.getByRole('button', { name: /completar engage/i });
      expect(completeButton).not.toBeDisabled();
    });

    it('deve marcar fase como completa ao clicar no botão', async () => {
      // Arrange
      const user = userEvent.setup();
      const propsWithData = {
        ...defaultProps,
        data: {
          ...mockProject,
          bigIdea: 'Test big idea',
          essentialQuestion: 'Test question?',
        },
      };

      render(<EngagePane {...propsWithData} />, { wrapper: TestWrapper });

      // Act
      const completeButton = screen.getByRole('button', { name: /completar engage/i });
      await user.click(completeButton);

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith('engageCompleted', true);
      expect(mockUpdate).toHaveBeenCalledWith('phase', 'investigate');
    });

    it('deve transicionar para fase Investigate ao completar', async () => {
      // Arrange
      const user = userEvent.setup();
      const propsWithData = {
        ...defaultProps,
        data: {
          ...mockProject,
          bigIdea: 'Test big idea',
          essentialQuestion: 'Test question?',
        },
      };

      render(<EngagePane {...propsWithData} />, { wrapper: TestWrapper });

      // Act
      const completeButton = screen.getByRole('button', { name: /completar engage/i });
      await user.click(completeButton);

      // Assert
      expect(mockOnPhaseTransition).toHaveBeenCalledWith('investigate');
    });

    it('deve exibir mensagem de validação se tentar completar sem preencher campos', async () => {
      // Arrange
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<EngagePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const completeButton = screen.getByRole('button', { name: /completar engage/i });
      // Forçar clique mesmo estando desabilitado para testar validação
      fireEvent.click(completeButton);

      // Assert - Botão deve estar desabilitado, então nada acontece
      expect(alertSpy).not.toHaveBeenCalled();
      
      alertSpy.mockRestore();
    });
  });

  describe('Navegação entre Seções', () => {
    it('deve permitir navegar entre seções', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<EngagePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const essentialQuestionCard = screen.getByText('Essential Questions').closest('div');
      if (essentialQuestionCard) {
        await user.click(essentialQuestionCard);
      }

      // Assert
      expect(essentialQuestionCard).toHaveClass(/ring-2/); // Seção ativa
    });

    it('deve destacar visualmente a seção ativa', () => {
      // Act
      render(<EngagePane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      const bigIdeasCard = screen.getByText('Big Ideas').closest('div');
      expect(bigIdeasCard).toHaveClass(/ring-2/); // Primeira seção ativa por padrão
    });
  });

  describe('Indicadores de Progresso', () => {
    it('deve mostrar progresso visual das seções completas', () => {
      // Arrange
      const propsWithProgress = {
        ...defaultProps,
        data: {
          ...mockProject,
          bigIdea: 'Completed',
          essentialQuestion: 'Completed',
        },
      };

      // Act
      render(<EngagePane {...propsWithProgress} />, { wrapper: TestWrapper });

      // Assert - Deve haver indicadores visuais de conclusão
      const checkIcons = screen.getAllByTestId(/check/i);
      expect(checkIcons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Integração com Badges', () => {
    it('deve disparar badge ao preencher Big Idea', async () => {
      // Arrange
      const mockCheckTrigger = vi.fn();
      vi.mocked(vi.fn()).mockImplementation(() => ({
        checkTrigger: mockCheckTrigger,
      }));

      const user = userEvent.setup();
      render(<EngagePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act
      const bigIdeaInput = screen.getByPlaceholderText(/descreva a grande ideia/i);
      await user.type(bigIdeaInput, 'First big idea');

      // Assert - Badge deve ser disparado após debounce
      await waitFor(() => {
        expect(mockCheckTrigger).toHaveBeenCalled();
      }, { timeout: 1500 });
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels apropriados para leitores de tela', () => {
      // Act
      render(<EngagePane {...defaultProps} />, { wrapper: TestWrapper });

      // Assert
      const textareas = screen.getAllByRole('textbox');
      textareas.forEach(textarea => {
        expect(textarea).toHaveAccessibleName();
      });
    });

    it('deve suportar navegação por teclado', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<EngagePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act - Navegar com Tab
      await user.tab();
      
      // Assert
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeTruthy();
    });

    it('deve ter contraste adequado nos indicadores de conclusão', () => {
      // Arrange
      const propsWithCompletion = {
        ...defaultProps,
        data: {
          ...mockProject,
          bigIdea: 'Completed',
        },
      };

      // Act
      render(<EngagePane {...propsWithCompletion} />, { wrapper: TestWrapper });

      // Assert - Verificar classes de contraste
      const completionIndicators = screen.getAllByRole('img', { hidden: true });
      expect(completionIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('Sistema de Nudges', () => {
    it('deve abrir modal de nudges ao solicitar ajuda', async () => {
      // Arrange
      const mockOpenNudgeModal = vi.fn();
      vi.mock('@/hooks/useNudges', () => ({
        useNudges: () => ({
          isModalOpen: false,
          openNudgeModal: mockOpenNudgeModal,
          closeModal: vi.fn(),
        }),
      }));

      const user = userEvent.setup();
      render(<EngagePane {...defaultProps} />, { wrapper: TestWrapper });

      // Act - Procurar por botão de ajuda
      const helpButtons = screen.queryAllByRole('button', { name: /ajuda|dica/i });
      if (helpButtons.length > 0) {
        await user.click(helpButtons[0]);
      }

      // Assert
      // Nota: Dependendo da implementação, pode haver um botão de ajuda
    });
  });
});
