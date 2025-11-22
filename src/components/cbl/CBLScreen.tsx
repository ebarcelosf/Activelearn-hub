import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EngagePane } from './EngagePane';
import { InvestigatePane } from './InvestigatePane';
import { ActPane } from './ActPane';
import { useProjects } from '@/contexts/ProjectContext';
import { useBadgeContextOptional } from '@/contexts/BadgeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, Search, Rocket } from 'lucide-react';
import { LucideIcon } from '@/components/shared/LucideIcon';

export const CBLScreen: React.FC = () => {
  const { currentProject, updateProject, getProjectProgress } = useProjects();
  const { phase } = useParams<{ phase: string }>();
  const navigate = useNavigate();
  const badge = useBadgeContextOptional();
  const checkTrigger = badge?.checkTrigger ?? (() => {});
  
  const currentPhase = phase || 'engage';

  // Sincroniza a fase do projeto com a rota para garantir gatilhos ao navegar direto
  React.useEffect(() => {
    if (!currentProject) return;
    if (currentProject.phase !== currentPhase) {
      updateProject(currentProject.id, { phase: currentPhase as 'engage' | 'investigate' | 'act' });
    }
    
    // Trigger badge quando entra na fase investigate pela primeira vez
    if (currentPhase === 'investigate') {
      checkTrigger('investigate_started');
    }
  }, [currentPhase, currentProject?.id, checkTrigger]);

  // Monitor project completion for Mestre CBL badge
  React.useEffect(() => {
    if (!currentProject) return;
    
    const isEngageComplete = !!(currentProject.bigIdea && currentProject.essentialQuestion);
    const isInvestigateComplete = !!(currentProject.answers && currentProject.answers.filter(a => a && a.a && a.a.trim()).length >= 3);
    const isActComplete = !!(currentProject.solution?.description && currentProject.implementation?.overview && currentProject.prototypes?.length > 0);
    
    // Check for Mestre CBL when all phases are genuinely complete
    if (isEngageComplete && isInvestigateComplete && isActComplete) {
      checkTrigger('cbl_cycle_completed');
    }
  }, [currentProject, checkTrigger]);

  if (!currentProject) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
              <LucideIcon name="Folder" className="w-10 h-10 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">Nenhum projeto selecionado</CardTitle>
            <CardDescription>
              Crie ou selecione um projeto para começar sua jornada CBL
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpdate = (field: string, value: any) => {
    updateProject(currentProject.id, { [field]: value });
  };

  const handlePhaseTransition = (newPhase: string) => {
    navigate(`/project/${currentProject.id}/${newPhase}`);
  };

  const progress = getProjectProgress(currentProject);
  
  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'engage': return Lightbulb;
      case 'investigate': return Search;
      case 'act': return Rocket;
      default: return Lightbulb;
    }
  };

  const getPhaseTitle = (phase: string) => {
    switch (phase) {
      case 'engage': return 'Engage';
      case 'investigate': return 'Investigate';
      case 'act': return 'Act';
      default: return 'Engage';
    }
  };

  const getPhaseDescription = (phase: string) => {
    switch (phase) {
      case 'engage': return 'Defina o problema central e perguntas orientadoras';
      case 'investigate': return 'Pesquise e colete dados para fundamentar sua solução';
      case 'act': return 'Desenvolva e implemente soluções inovadoras';
      default: return 'Defina o problema central e perguntas orientadoras';
    }
  };

  const PhaseIcon = getPhaseIcon(currentPhase);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-none">
      {/* Header do Projeto */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  <PhaseIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-lg sm:text-2xl leading-tight">
                    <span className="hidden sm:inline">{getPhaseTitle(currentPhase)} — {currentProject.title}</span>
                    <span className="sm:hidden">{getPhaseTitle(currentPhase)}</span>
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {getPhaseDescription(currentPhase)}
                  </CardDescription>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs sm:text-sm shrink-0">
              Fase {currentPhase}
            </Badge>
          </div>
          
          {/* Barra de Progresso do Projeto */}
          <div className="space-y-2 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progresso Geral</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Conteúdo da Fase */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          {currentPhase === 'engage' && (
            <EngagePane 
              data={currentProject} 
              update={handleUpdate}
              onPhaseTransition={handlePhaseTransition}
            />
          )}
          {currentPhase === 'investigate' && (
            <InvestigatePane 
              data={currentProject} 
              update={handleUpdate}
              onPhaseTransition={handlePhaseTransition}
            />
          )}
          {currentPhase === 'act' && (
            <ActPane 
              data={currentProject} 
              update={handleUpdate}
              onPhaseTransition={handlePhaseTransition}
            />
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};