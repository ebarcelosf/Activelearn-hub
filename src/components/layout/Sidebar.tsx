import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation, useInRouterContext } from 'react-router-dom';
import { 
  Lightbulb, 
  Search, 
  Rocket, 
  Home, 
  Trophy,
  Settings,
  X,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useProjects } from '@/contexts/ProjectContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarInner: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { currentProject, getProjectProgress, updateProject } = useProjects();
  
  const currentPath = location.pathname;
  const progress = currentProject ? getProjectProgress(currentProject) : 0;

  const mainNavItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Trophy, label: 'Conquistas', path: '/achievements' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  const phaseNavItems = currentProject ? [
    { 
      icon: Lightbulb, 
      label: 'Engage', 
      path: `/project/${currentProject.id}/engage`,
      phase: 'engage' as const,
      description: 'Definir problema e desafios',
      status: currentProject.bigIdea && currentProject.essentialQuestion ? 'completed' : 
              currentProject.bigIdea || currentProject.essentialQuestion ? 'progress' : 'pending'
    },
    { 
      icon: Search, 
      label: 'Investigate', 
      path: `/project/${currentProject.id}/investigate`,
      phase: 'investigate' as const,
      description: 'Pesquisar e analisar',
      status: currentProject.synthesis?.mainFindings ? 'completed' :
              (currentProject.answers && currentProject.answers.length > 0) || (currentProject.activities && currentProject.activities.length > 0) ? 'progress' : 'pending'
    },
    { 
      icon: Rocket, 
      label: 'Act', 
      path: `/project/${currentProject.id}/act`,
      phase: 'act' as const,
      description: 'Desenvolver e implementar',
      status: currentProject.act_completed ? 'completed' :
              currentProject.solution?.description || currentProject.implementation?.overview || (currentProject.prototypes && currentProject.prototypes.length > 0) ? 'progress' : 'pending'
    },
  ] : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'progress':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 z-50 h-full w-full max-w-xs sm:w-80 bg-card border-r shadow-lg safe-top safe-bottom lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b lg:hidden">
                <h2 className="font-semibold">Navegação</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Main Navigation */}
                <div>
                  <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Principal
                  </h3>
                  <nav className="space-y-1">
                    {mainNavItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                          )
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </NavLink>
                    ))}
                  </nav>
                </div>

                {/* Project Navigation */}
                {currentProject && (
                  <div>
                    <div className="mb-3">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Projeto Atual
                      </h3>
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <p className="font-medium text-sm truncate">{currentProject.title}</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progresso</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <nav className="space-y-1">
                      {phaseNavItems.map((item, index) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => {
                            if (currentProject) {
                              updateProject(currentProject.id, { phase: item.phase });
                            }
                            onClose();
                          }}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 rounded-lg p-3 text-sm transition-colors group",
                              "hover:bg-accent/50",
                              isActive ? "bg-primary/10 border border-primary/20" : "bg-muted/20"
                            )
                          }
                        >
                          <div className="flex-shrink-0">
                            <item.icon className={cn(
                              "h-5 w-5",
                              currentPath === item.path ? "text-primary" : "text-muted-foreground"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={cn(
                                "font-medium",
                                currentPath === item.path ? "text-primary" : "text-foreground"
                              )}>
                                {item.label}
                              </p>
                              {getStatusIcon(item.status)}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </p>
                          </div>
                        </NavLink>
                      ))}
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const inRouter = useInRouterContext();
  if (!inRouter) return null;
  return <SidebarInner {...props} />;
};
