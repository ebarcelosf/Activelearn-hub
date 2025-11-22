import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MoreVertical, Copy, Trash2, Play } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Project } from '@/types';
import { useProjects } from '@/contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit }) => {
  const { getProjectProgress, duplicateProject, deleteProject } = useProjects();
  const navigate = useNavigate();
  
  const progress = getProjectProgress(project);
  
  // Garantir que o progresso seja um número válido
  const displayProgress = isNaN(progress) ? 0 : Math.max(0, Math.min(100, progress));
  
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'engage':
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'investigate':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'act':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      default:
        return 'bg-muted';
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'engage':
        return 'Engage';
      case 'investigate':
        return 'Investigate';
      case 'act':
        return 'Act';
      default:
        return phase;
    }
  };

  const handleOpenProject = () => {
    // Navegar para a fase atual do projeto ou a primeira fase acessível
    const currentPhase = project.phase || 'engage';
    navigate(`/project/${project.id}/${currentPhase}`);
  };

  const handleDuplicate = () => {
    duplicateProject(project.id);
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      deleteProject(project.id);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="h-full interactive-scale card-elevated hover:card-glow transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-3 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg truncate mb-1">{project.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleOpenProject}>
                  <Play className="mr-2 h-4 w-4" />
                  Abrir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{displayProgress}%</span>
            </div>
            <Progress value={displayProgress} className="h-2" />
          </div>

          {/* Phase Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={`${getPhaseColor(project.phase)} text-xs`}
            >
              {getPhaseLabel(project.phase)}
            </Badge>
            
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">{new Date(project.updatedAt).toLocaleDateString('pt-BR')}</span>
              <span className="sm:hidden">{new Date(project.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleOpenProject}
            className="w-full gradient-primary text-white hover:opacity-90 text-sm sm:text-base h-9 sm:h-10"
          >
            <span className="hidden sm:inline">Continuar Projeto</span>
            <span className="sm:hidden">Continuar</span>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};