import React, { useEffect } from 'react';
import { useBadgeContextOptional } from '@/contexts/BadgeContext';
import { toast } from 'sonner';
import { ALL_BADGES } from '@/utils/badgeConstants';

export const BadgeNotificationToast: React.FC = () => {
  const badgeContext = useBadgeContextOptional();

  useEffect(() => {
    if (badgeContext?.showNotification && badgeContext?.recentBadge) {
      const badge = ALL_BADGES[badgeContext.recentBadge];
      
      if (badge) {
        toast.success(`🏆 Badge conquistado: ${badge.title}!`, {
          description: `${badge.desc} (+${badge.xp} XP)`,
          duration: 5000,
        });
      }
    }
    
    // Always dismiss the notification
    if (badgeContext?.showNotification) {
      badgeContext.dismissNotification();
    }
  }, [badgeContext?.showNotification, badgeContext?.recentBadge, badgeContext]);

  return null;
};