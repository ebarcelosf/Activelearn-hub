import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BadgeNotification } from '@/components/shared/BadgeNotification';
import { useBadgeContextOptional } from '@/contexts/BadgeContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const badgeContext = useBadgeContextOptional();

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background no-scroll-x">
      <Header 
        onMenuClick={handleMenuClick}
        showMenuButton={true}
      />
      
      <div className="flex relative">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 overflow-x-hidden min-w-0 w-full">
          <div className="w-full max-w-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Badge Notification */}
      {badgeContext?.recentBadge && (
        <BadgeNotification
          badge={badgeContext.earnedBadges.find(b => b.id === badgeContext.recentBadge) || { id: badgeContext.recentBadge || '', name: '', description: '', icon: '' }}
          show={badgeContext.showNotification}
          onDismiss={badgeContext.dismissNotification}
        />
      )}
    </div>
  );
};