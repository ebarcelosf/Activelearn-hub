import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Activity {
  id: string;
  project_id: string;
  title: string;
  description: string;
  type: string;
  status: 'planned' | 'in-progress' | 'completed';
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export const useActivities = (projectId: string) => {
  const queryClient = useQueryClient();

  // Fetch activities
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      // Map database fields to component interface
      return data.map(item => ({
        ...item,
        createdAt: item.created_at,
        completedAt: item.completed_at,
        status: item.status === 'pending' ? 'planned' : item.status,
        description: item.description || '',
        type: item.type || ''
      })) as Activity[];
    },
    enabled: !!projectId,
  });

  // Add activity mutation
  const addActivityMutation = useMutation({
    mutationFn: async (activityData: Omit<Activity, 'id' | 'project_id' | 'createdAt' | 'completedAt'>) => {
      const { data, error } = await supabase
        .from('activities')
        .insert({ 
          ...activityData, 
          project_id: projectId,
          status: activityData.status === 'planned' ? 'pending' : activityData.status || 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return {
        ...data,
        createdAt: data.created_at,
        completedAt: data.completed_at,
        status: data.status === 'pending' ? 'planned' : data.status
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
      toast.success('Atividade adicionada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao adicionar atividade:', error);
      toast.error('Erro ao adicionar atividade');
    },
  });

  // Update activity mutation
  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Activity> }) => {
      // Convert component interface to database interface
      const dbUpdates = {
        ...updates,
        created_at: updates.createdAt,
        completed_at: updates.completedAt,
        status: updates.status === 'planned' ? 'pending' : updates.status
      };
      delete (dbUpdates as any).createdAt;
      delete (dbUpdates as any).completedAt;

      const { data, error } = await supabase
        .from('activities')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return {
        ...data,
        createdAt: data.created_at,
        completedAt: data.completed_at,
        status: data.status === 'pending' ? 'planned' : data.status
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar atividade:', error);
      toast.error('Erro ao atualizar atividade');
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const activity = activities.find(a => a.id === id);
      if (!activity) throw new Error('Atividade não encontrada');

      const statusTransitions: Record<string, string> = {
        'planned': 'in-progress',
        'in-progress': 'completed',
        'completed': 'planned'
      };

      const newStatus = statusTransitions[activity.status] || 'planned';
      const dbStatus = newStatus === 'planned' ? 'pending' : newStatus;
      const dbUpdates = { 
        status: dbStatus
      };

      if (newStatus === 'completed') {
        (dbUpdates as any).completed_at = new Date().toISOString();
      } else {
        (dbUpdates as any).completed_at = null;
      }

      const { data, error } = await supabase
        .from('activities')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return {
        ...data,
        createdAt: data.created_at,
        completedAt: data.completed_at,
        status: data.status === 'pending' ? 'planned' : data.status
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
    },
    onError: (error) => {
      console.error('Erro ao alterar status da atividade:', error);
      toast.error('Erro ao alterar status da atividade');
    },
  });

  // Remove activity mutation
  const removeActivityMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
      toast.success('Atividade removida com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao remover atividade:', error);
      toast.error('Erro ao remover atividade');
    },
  });

  return {
    activities,
    isLoading,
    addActivity: (activityData: Omit<Activity, 'id' | 'project_id' | 'createdAt' | 'completedAt'>) => 
      addActivityMutation.mutate(activityData),
    updateActivity: (id: string, updates: Partial<Activity>) => 
      updateActivityMutation.mutate({ id, updates }),
    toggleStatus: (id: string) => toggleStatusMutation.mutate(id),
    removeActivity: (id: string) => removeActivityMutation.mutate(id),
  };
};