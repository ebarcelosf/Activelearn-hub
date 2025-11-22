import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ALL_BADGES, BADGE_LIST } from '@/utils/badgeConstants';
import { toast } from 'sonner';

export interface UserBadge {
  id: number;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export const useBadges = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user badges
  const { data: earnedBadges = [], isLoading } = useQuery({
    queryKey: ['badges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Grant badge mutation
  const grantBadgeMutation = useMutation({
    mutationFn: async (badgeId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: user.id,
          badge_id: badgeId,
        });

      if (error) throw error;
    },
    onSuccess: (_, badgeId) => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      
      // Show toast notification
      const badge = ALL_BADGES[badgeId];
      
      if (badge) {
        toast.success(`Badge conquistado: ${badge.title}!`);
      }
    },
    onError: () => {
      toast.error('Erro ao conquistar badge');
    },
  });

  const grantBadge = (badgeId: string) => {
    // Check if badge already earned
    const alreadyEarned = earnedBadges.some(badge => badge.badge_id === badgeId);
    if (alreadyEarned) return;
    
    grantBadgeMutation.mutate(badgeId);
  };

  const canEarnBadge = (badgeId: string): boolean => {
    return !earnedBadges.some(badge => badge.badge_id === badgeId);
  };

  const getBadgesByCategory = () => {
    const result: any = {};
    
    // Group badges by category
    BADGE_LIST.forEach(badge => {
      if (!result[badge.category]) {
        result[badge.category] = { earned: [], unearned: [] };
      }
      
      const isEarned = earnedBadges.some(earned => earned.badge_id === badge.id);
      if (isEarned) {
        result[badge.category].earned.push(badge);
      } else {
        result[badge.category].unearned.push(badge);
      }
    });
    
    return result;
  };

  const totalXP = earnedBadges.reduce((total, badge) => {
    const badgeInfo = ALL_BADGES[badge.badge_id];
    return total + (badgeInfo?.xp || 0);
  }, 0);

  // Calculate level based on XP thresholds (1-5)
  const calculateLevel = (xp: number): number => {
    if (xp >= 1000) return 5;
    if (xp >= 600) return 4;
    if (xp >= 300) return 3;
    if (xp >= 100) return 2;
    return 1;
  };

  const level = calculateLevel(totalXP);
  
  // Calculate XP needed for next level
  const xpThresholds = [0, 100, 300, 600, 1000];
  const nextLevelThreshold = level < 5 ? xpThresholds[level] : 1000;
  const xpForNextLevel = level < 5 ? nextLevelThreshold - totalXP : 0;

  return {
    earnedBadges,
    isLoading,
    grantBadge,
    canEarnBadge,
    getBadgesByCategory,
    totalXP,
    level,
    xpForNextLevel,
  };
};