import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  phase: 'engage' | 'investigate' | 'act';
  engage_completed: boolean;
  investigate_completed: boolean;
  act_completed: boolean;
  big_idea?: string;
  essential_question?: string;
  challenge?: string;
  synthesis?: any;
  solution?: any;
  implementation?: any;
  evaluation?: any;
  created_at: string;
  updated_at: string;
  lastModified: string; // For compatibility
  
  // Legacy compatibility fields
  bigIdea?: string;
  essentialQuestion?: string;
  answers?: any[];
  activities?: any[];
  prototypes?: any[];
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export const useProjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Check if notifications are enabled
  const canShowNotification = () => {
    const saved = localStorage.getItem('notificationSettings');
    const settings = saved ? JSON.parse(saved) : { showAllNotifications: true };
    return settings.showAllNotifications;
  };

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Transform for compatibility
      return data.map(project => ({
        ...project,
        phase: project.phase as 'engage' | 'investigate' | 'act',
        lastModified: project.updated_at,
        bigIdea: project.big_idea,
        essentialQuestion: project.essential_question,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        answers: [],
        activities: [],
        prototypes: [],
        progress: 0
      }));
    },
    enabled: !!user,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title,
          description,
          phase: 'engage',
        })
        .select()
        .single();

      if (error) throw error;
      return { 
        ...data, 
        phase: data.phase as 'engage' | 'investigate' | 'act',
        lastModified: data.updated_at,
        bigIdea: data.big_idea,
        essentialQuestion: data.essential_question,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        answers: [],
        activities: [],
        prototypes: [],
        progress: 0
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (canShowNotification()) {
        toast.success('Projeto criado com sucesso!');
      }
    },
    onError: () => {
      if (canShowNotification()) {
        toast.error('Erro ao criar projeto');
      }
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ projectId, updates }: { projectId: string; updates: Partial<Project> }) => {
      // Map legacy field names to database field names
      const dbUpdates: any = { ...updates };
      
      // Map legacy fields to database fields
      if ('bigIdea' in updates) {
        dbUpdates.big_idea = updates.bigIdea as any;
        delete dbUpdates.bigIdea;
      }
      if ('essentialQuestion' in updates) {
        dbUpdates.essential_question = updates.essentialQuestion as any;
        delete dbUpdates.essentialQuestion;
      }
      if ('engageCompleted' in updates) {
        (dbUpdates as any).engage_completed = (updates as any).engageCompleted;
        delete (dbUpdates as any).engageCompleted;
      }
      if ('investigateCompleted' in updates) {
        (dbUpdates as any).investigate_completed = (updates as any).investigateCompleted;
        delete (dbUpdates as any).investigateCompleted;
      }
      if ('actCompleted' in updates) {
        (dbUpdates as any).act_completed = (updates as any).actCompleted;
        delete (dbUpdates as any).actCompleted;
      }
      
      // Remove legacy compatibility fields that don't exist in database
      delete dbUpdates.lastModified;
      delete dbUpdates.createdAt;
      delete dbUpdates.updatedAt;
      delete dbUpdates.answers;
      delete dbUpdates.activities;
      delete dbUpdates.resources;
      delete dbUpdates.prototypes;
      delete dbUpdates.progress;
      delete dbUpdates.engageChecklistItems;
      delete dbUpdates.investigateChecklistItems;
      delete dbUpdates.actChecklistItems;

      const { error } = await supabase
        .from('projects')
        .update(dbUpdates)
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: () => {
      if (canShowNotification()) {
        toast.error('Erro ao atualizar projeto');
      }
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (canShowNotification()) {
        toast.success('Projeto excluído com sucesso!');
      }
    },
    onError: () => {
      if (canShowNotification()) {
        toast.error('Erro ao excluir projeto');
      }
    },
  });

  // Helper functions
  const createProject = (title: string, description: string) => {
    return createProjectMutation.mutateAsync({ title, description });
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    updateProjectMutation.mutate({ projectId, updates });
  };

  const deleteProject = (projectId: string) => {
    deleteProjectMutation.mutate(projectId);
  };

  const duplicateProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Projeto não encontrado');

    try {
      // 1. Create the new project with all main data
      const newProject = await createProjectMutation.mutateAsync({
        title: `${project.title} (Cópia)`,
        description: project.description,
      });

      // 2. Update the new project with all the original project data
      const projectUpdates = {
        phase: project.phase,
        big_idea: project.big_idea,
        essential_question: project.essential_question,
        challenge: project.challenge,
        synthesis: project.synthesis,
        solution: project.solution,
        implementation: project.implementation,
        evaluation: project.evaluation,
        engage_completed: project.engage_completed,
        investigate_completed: project.investigate_completed,
        act_completed: project.act_completed,
      };

      // Remove null/undefined values
      const cleanUpdates = Object.fromEntries(
        Object.entries(projectUpdates).filter(([_, value]) => value !== null && value !== undefined)
      );

      if (Object.keys(cleanUpdates).length > 0) {
        await supabase
          .from('projects')
          .update(cleanUpdates)
          .eq('id', newProject.id);
      }

      // 3. Copy guiding questions
      const { data: guidingQuestions } = await supabase
        .from('guiding_questions')
        .select('*')
        .eq('project_id', projectId);

      if (guidingQuestions && guidingQuestions.length > 0) {
        const questionsToInsert = guidingQuestions.map(q => ({
          project_id: newProject.id,
          question: q.question,
          answer: q.answer,
        }));

        await supabase
          .from('guiding_questions')
          .insert(questionsToInsert);
      }

      // 4. Copy activities
      const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .eq('project_id', projectId);

      if (activities && activities.length > 0) {
        const activitiesToInsert = activities.map(a => ({
          project_id: newProject.id,
          title: a.title,
          description: a.description,
          type: a.type,
          status: a.status,
          notes: a.notes,
        }));

        await supabase
          .from('activities')
          .insert(activitiesToInsert);
      }

      // 5. Copy resources
      const { data: resources } = await supabase
        .from('resources')
        .select('*')
        .eq('project_id', projectId);

      if (resources && resources.length > 0) {
        const resourcesToInsert = resources.map(r => ({
          project_id: newProject.id,
          title: r.title,
          url: r.url,
          type: r.type,
          credibility: r.credibility,
          notes: r.notes,
          tags: r.tags,
        }));

        await supabase
          .from('resources')
          .insert(resourcesToInsert);
      }

      // 6. Copy prototypes
      const { data: prototypes } = await supabase
        .from('prototypes')
        .select('*')
        .eq('project_id', projectId);

      if (prototypes && prototypes.length > 0) {
        const prototypesToInsert = prototypes.map(p => ({
          project_id: newProject.id,
          title: p.title,
          description: p.description,
          fidelity: p.fidelity,
          test_results: p.test_results,
          next_steps: p.next_steps,
          files: p.files,
        }));

        await supabase
          .from('prototypes')
          .insert(prototypesToInsert);
      }

      // 7. Copy checklist items for all phases
      const { data: checklistItems } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('project_id', projectId);

      if (checklistItems && checklistItems.length > 0) {
        const checklistToInsert = checklistItems.map(c => ({
          project_id: newProject.id,
          phase: c.phase,
          text: c.text,
          done: c.done,
        }));

        await supabase
          .from('checklist_items')
          .insert(checklistToInsert);
      }

      // Refresh all related queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['guiding-questions', newProject.id] });
      queryClient.invalidateQueries({ queryKey: ['activities', newProject.id] });
      queryClient.invalidateQueries({ queryKey: ['resources', newProject.id] });
      queryClient.invalidateQueries({ queryKey: ['prototypes', newProject.id] });
      queryClient.invalidateQueries({ queryKey: ['checklist-items', newProject.id] });
      
      if (canShowNotification()) {
        toast.success('Projeto duplicado com todos os dados!');
      }

      return newProject;
    } catch (error) {
      console.error('Erro ao duplicar projeto:', error);
      if (canShowNotification()) {
        toast.error('Erro ao duplicar projeto');
      }
      throw error;
    }
  };

  const getProjectProgress = (project: Project): number => {
    let totalFields = 0;
    let completedFields = 0;

    // Check engage phase
    if (project.big_idea) completedFields++;
    if (project.essential_question) completedFields++;
    totalFields += 2;

    // Check investigate phase
    if (project.synthesis) completedFields++;
    totalFields += 1;

    // Check act phase
    if (project.solution) completedFields++;
    if (project.implementation) completedFields++;
    if (project.evaluation) completedFields++;
    totalFields += 3;

    return Math.round((completedFields / totalFields) * 100);
  };

  return {
    projects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    getProjectProgress,
  };
};