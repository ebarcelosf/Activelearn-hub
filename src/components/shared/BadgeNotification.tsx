// components/shared/BadgeNotification.tsx
import React from 'react';
import { Badge } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { LucideIcon } from './LucideIcon';
import { icons } from 'lucide-react';

interface BadgeNotificationProps {
  badge: Badge;
  show: boolean;
  onDismiss: () => void;
}

export const BadgeNotification: React.FC<BadgeNotificationProps> = ({ badge, show, onDismiss }) => {
  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <Card className="p-4 shadow-lg border-l-4 border-l-primary max-w-sm">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
            {badge.icon && badge.icon in icons ? (
              <LucideIcon name={badge.icon as keyof typeof icons} size={24} />
            ) : (
              <LucideIcon name="Award" size={24} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-sm text-foreground">Badge Conquistado!</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <h5 className="font-medium text-foreground mb-1">{badge.name}</h5>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{badge.description}</p>
            <div className="text-xs font-medium text-primary">+{badge.xp} XP</div>
          </div>
        </div>
      </Card>
    </div>
  );
};