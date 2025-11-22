// pages/Achievements.tsx
import React from 'react';
import { useBadgeContext } from '@/contexts/BadgeContext';
import AchievementsScreen from '@/components/shared/AchievementsScreen';

export const Achievements: React.FC = () => {
  const badge = useBadgeContext();
  const earnedBadges = badge.earnedBadges ?? [];
  const availableBadges = badge.availableBadges ?? [];
  const totalXP = badge.totalXP ?? 0;
  const level = badge.level ?? 1;
  const progressPercentage = badge.progressPercentage ?? 0;

  const unlockedBadges = availableBadges.filter(badge => 
    !earnedBadges.some(earned => earned.id === badge.id)
  );

  return (
    <AchievementsScreen
      earnedBadges={earnedBadges}
      availableBadges={unlockedBadges}
      totalXP={totalXP}
      level={level}
      progressPercentage={progressPercentage}
    />
  );
};