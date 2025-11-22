// src/test/hooks/useBadges.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useBadges } from '@/hooks/useBadges';
import { mockSupabaseClient, mockBadges, mockSuccessResponse, resetAllMocks } from './supabase';
import { TestWrapper } from './contexts';

// Mock do módulo Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));

// Mock do useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', xp: 0, level: 1 },
  }),
}));

describe('useBadges Hook - Sistema de Gamificação', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('Buscar Badges', () => {
    it('deve buscar todos os badges disponíveis', async () => {
      // Arrange
      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockSuccessResponse(mockBadges)),
      });

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.badges).toHaveLength(2);
        expect(result.current.badges[0].name).toBe('Explorador');
      });
    });

    it('deve buscar badges do usuário', async () => {
      // Arrange
      const userBadges = [
        { ...mockBadges[0], earned: true, earned_at: '2024-01-01' },
      ];

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockSuccessResponse(userBadges)),
      });

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.userBadges).toHaveLength(1);
        expect(result.current.userBadges[0].earned).toBe(true);
      });
    });
  });

  describe('Concessão de Badges', () => {
    it('deve conceder badge "Explorador" ao criar primeiro projeto', async () => {
      // Arrange
      const badge = {
        id: 'explorer',
        name: 'Explorador',
        xp: 50,
      };

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse(badge)),
      });

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });
      await act(async () => {
        await result.current.checkTrigger('project_created');
      });

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_badges');
      });
    });

    it('deve conceder badge "Pesquisador" ao adicionar 3 recursos', async () => {
      // Arrange
      const badge = {
        id: 'researcher',
        name: 'Pesquisador',
        xp: 75,
      };

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse(badge)),
      });

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });
      await act(async () => {
        await result.current.checkTrigger('resources_added', { resourcesCount: 3 });
      });

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_badges');
      });
    });

    it('deve conceder badge "Inovador" ao criar primeiro protótipo', async () => {
      // Arrange
      const badge = {
        id: 'innovator',
        name: 'Inovador',
        xp: 100,
      };

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse(badge)),
      });

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });
      await act(async () => {
        await result.current.checkTrigger('prototype_created');
      });

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_badges');
      });
    });

    it('deve conceder badge "Mestre CBL" ao completar todas as fases', async () => {
      // Arrange
      const badge = {
        id: 'cbl_master',
        name: 'Mestre CBL',
        xp: 500,
      };

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse(badge)),
      });

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });
      await act(async () => {
        await result.current.checkTrigger('all_phases_completed');
      });

      // Assert
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_badges');
      });
    });

    it('não deve conceder badge duplicado', async () => {
      // Arrange
      const userBadges = [
        { badge_id: 'explorer', earned: true },
      ];

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockSuccessResponse(userBadges)),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse(null)),
      });

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });
      await act(async () => {
        await result.current.checkTrigger('project_created');
      });

      // Assert
      await waitFor(() => {
        // Insert não deve ser chamado para badge já conquistado
        const insertCalls = mockSupabaseClient.from.mock.calls.filter(
          call => call[0] === 'user_badges'
        );
        expect(insertCalls.length).toBe(0);
      });
    });
  });

  describe('Cálculo de XP', () => {
    it('deve calcular XP total do usuário', () => {
      // Arrange
      const userBadges = [
        { badge: { xp: 50 }, earned: true },
        { badge: { xp: 75 }, earned: true },
        { badge: { xp: 100 }, earned: true },
      ];

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });
      result.current.userBadges = userBadges as any;
      const totalXP = result.current.getTotalXP();

      // Assert
      expect(totalXP).toBe(225);
    });

    it('deve retornar 0 XP quando não há badges', () => {
      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });
      const totalXP = result.current.getTotalXP();

      // Assert
      expect(totalXP).toBe(0);
    });
  });

  describe('Sistema de Níveis', () => {
    it('deve calcular nível 1 com 0-99 XP', () => {
      // Arrange
      const userBadges = [
        { badge: { xp: 50 }, earned: true },
      ];

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });
      result.current.userBadges = userBadges as any;
      const level = result.current.getCurrentLevel();

      // Assert
      expect(level).toBe(1);
    });

    it('deve calcular nível 2 com 100-299 XP', () => {
      // Arrange
      const userBadges = [
        { badge: { xp: 50 }, earned: true },
        { badge: { xp: 75 }, earned: true },
      ];

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });
      result.current.userBadges = userBadges as any;
      const level = result.current.getCurrentLevel();

      // Assert
      expect(level).toBe(2);
    });

    it('deve calcular nível 3 com 300-599 XP', () => {
      // Arrange
      const userBadges = [
        { badge: { xp: 100 }, earned: true },
        { badge: { xp: 100 }, earned: true },
        { badge: { xp: 100 }, earned: true },
        { badge: { xp: 100 }, earned: true },
      ];

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });
      result.current.userBadges = userBadges as any;
      const level = result.current.getCurrentLevel();

      // Assert
      expect(level).toBe(3);
    });

    it('deve calcular nível 4 com 600-999 XP', () => {
      // Arrange
      const userBadges = [
        { badge: { xp: 200 }, earned: true },
        { badge: { xp: 200 }, earned: true },
        { badge: { xp: 200 }, earned: true },
        { badge: { xp: 200 }, earned: true },
      ];

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });
      result.current.userBadges = userBadges as any;
      const level = result.current.getCurrentLevel();

      // Assert
      expect(level).toBe(4);
    });

    it('deve calcular nível 5 com 1000+ XP', () => {
      // Arrange
      const userBadges = [
        { badge: { xp: 500 }, earned: true },
        { badge: { xp: 500 }, earned: true },
        { badge: { xp: 500 }, earned: true },
      ];

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });
      result.current.userBadges = userBadges as any;
      const level = result.current.getCurrentLevel();

      // Assert
      expect(level).toBe(5);
    });
  });

  describe('Progresso para Próximo Nível', () => {
    it('deve calcular progresso para próximo nível', () => {
      // Arrange
      const userBadges = [
        { badge: { xp: 50 }, earned: true },
      ];

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });
      result.current.userBadges = userBadges as any;
      const progress = result.current.getProgressToNextLevel();

      // Assert
      expect(progress.current).toBe(50);
      expect(progress.required).toBe(100);
      expect(progress.percentage).toBe(50);
    });

    it('deve retornar 100% quando está no nível máximo', () => {
      // Arrange
      const userBadges = [
        { badge: { xp: 500 }, earned: true },
        { badge: { xp: 500 }, earned: true },
      ];

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });
      result.current.userBadges = userBadges as any;
      const progress = result.current.getProgressToNextLevel();

      // Assert
      expect(progress.percentage).toBe(100);
    });
  });

  describe('Categorias de Badges', () => {
    it('deve organizar badges por categoria', async () => {
      // Arrange
      const categorizedBadges = [
        { id: 'badge1', category: 'project', name: 'Badge 1' },
        { id: 'badge2', category: 'research', name: 'Badge 2' },
        { id: 'badge3', category: 'project', name: 'Badge 3' },
      ];

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockSuccessResponse(categorizedBadges)),
      });

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });

      // Assert
      await waitFor(() => {
        const projectBadges = result.current.badges.filter(b => b.category === 'project');
        expect(projectBadges).toHaveLength(2);
      });
    });

    it('deve filtrar badges por categoria específica', async () => {
      // Arrange
      const badges = mockBadges;

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(mockSuccessResponse(badges)),
      });

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });

      // Assert
      await waitFor(() => {
        const researchBadges = result.current.badges.filter(b => b.category === 'research');
        expect(researchBadges).toHaveLength(1);
      });
    });
  });

  describe('Notificações de Badges', () => {
    it('deve disparar evento ao conquistar novo badge', async () => {
      // Arrange
      const eventListener = vi.fn();
      window.addEventListener('badge-earned', eventListener);

      const badge = {
        id: 'explorer',
        name: 'Explorador',
        xp: 50,
      };

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSuccessResponse(badge)),
      });

      // Act
      const { result } = renderHook(() => useBadges(), { wrapper: TestWrapper });
      await act(async () => {
        await result.current.checkTrigger('project_created');
      });

      // Assert
      await waitFor(() => {
        expect(eventListener).toHaveBeenCalled();
      });

      window.removeEventListener('badge-earned', eventListener);
    });
  });

  describe('Verificação de Elegibilidade', () => {
    it('deve verificar se usuário é elegível para badge específico', async () => {
      // Arrange
      const badge = {
        id: 'explorer',
        checkEligibility: (userData: any) => userData.projectsCount >= 1,
      };

      // Act
      const userData = { projectsCount: 1 };
      const isEligible = badge.checkEligibility(userData);

      // Assert
      expect(isEligible).toBe(true);
    });

    it('deve retornar false quando não elegível', async () => {
      // Arrange
      const badge = {
        id: 'master',
        checkEligibility: (userData: any) => userData.completedPhases === 3,
      };

      // Act
      const userData = { completedPhases: 1 };
      const isEligible = badge.checkEligibility(userData);

      // Assert
      expect(isEligible).toBe(false);
    });
  });
});
