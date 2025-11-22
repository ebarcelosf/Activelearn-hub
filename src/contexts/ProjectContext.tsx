import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useProjects as useProjectsHook, Project } from '@/hooks/useProjects';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  createProject: (title: string, description: string) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  duplicateProject: (projectId: string) => Promise<Project>;
  setCurrentProject: (project: Project | null) => void;
  getProjectProgress: (project: Project) => number;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const { projects, isLoading, createProject, updateProject, deleteProject, duplicateProject, getProjectProgress } = useProjectsHook();

  const value: ProjectContextType = {
    projects,
    currentProject,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    setCurrentProject,
    getProjectProgress,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};