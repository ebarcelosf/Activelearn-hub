import React, { useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { CBLScreen } from '@/components/cbl/CBLScreen';
import { useProjects } from '@/contexts/ProjectContext';

export const CBLProjectView: React.FC = () => {
  const { projectId, phase } = useParams<{ projectId: string; phase: string }>();
  const navigate = useNavigate();
  const { projects, setCurrentProject, currentProject } = useProjects();

  useEffect(() => {
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setCurrentProject(project);
      }
    }
  }, [projectId, projects, setCurrentProject]);

  // Verificar se o projeto existe
  const project = projects.find(p => p.id === projectId);
  if (!project) {
    return <Navigate to="/" replace />;
  }

  // Verificar se a fase é válida
  const validPhases = ['engage', 'investigate', 'act'];
  if (!phase || !validPhases.includes(phase)) {
    return <Navigate to={`/project/${projectId}/engage`} replace />;
  }

  // Lógica de validação de progressão sequencial
  const canAccessPhase = (requestedPhase: string): boolean => {
    switch (requestedPhase) {
      case 'engage':
        return true;
      case 'investigate':
        // Pode acessar se o engage foi marcado como completo OU se tem big idea e essential question
        return !!(project.engage_completed || (project.bigIdea && project.essentialQuestion));
      case 'act':
        // Pode acessar se o investigate foi marcado como completo ou se a fase já está definida como 'act'
        return !!(project.investigate_completed || project.phase === 'act');
      default:
        return false;
    }
  };

  // Redirecionar se não puder acessar a fase
  if (!canAccessPhase(phase)) {
    if (phase === 'investigate' && !canAccessPhase('investigate')) {
      return <Navigate to={`/project/${projectId}/engage`} replace />;
    }
    if (phase === 'act' && !canAccessPhase('act')) {
      return <Navigate to={`/project/${projectId}/investigate`} replace />;
    }
  }

  return <CBLScreen />;
};