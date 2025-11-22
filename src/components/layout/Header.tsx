import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Settings, LogOut, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useBadgeContextOptional } from '@/contexts/BadgeContext';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, showMenuButton }) => {
  const { user, logout } = useAuth();
  const badgeContext = useBadgeContextOptional();

  if (!user) return null;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 safe-top"
    >
      <div className="w-full flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 max-w-none">
        {/* Logo and Menu */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {showMenuButton && (
            <Button variant="ghost" size="sm" onClick={onMenuClick} className="p-2 touch-target">
              <Menu className="h-4 w-4" />
            </Button>
          )}
          
          <motion.div
            className="flex items-center gap-1 sm:gap-2 min-w-0"
            whileHover={{ scale: 1.02 }}
          >
            <div className="gradient-primary rounded-lg p-1.5 sm:p-2 flex-shrink-0">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="font-bold text-sm sm:text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
              <span className="hidden sm:inline">ActiveLearn Hub</span>
              <span className="sm:hidden">ALH</span>
            </span>
          </motion.div>
        </div>

        {/* User Name */}
        <div className="flex items-center min-w-0 flex-shrink-0">
          <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-20 sm:max-w-none">
            {user.name}
          </span>
        </div>
      </div>
    </motion.header>
  );
};