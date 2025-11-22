import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Prototype {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  fidelity?: 'low' | 'medium' | 'high';
  test_results?: string;
  next_steps?: string;
  files?: string[];
  created_at: string;
}

export const usePrototypes = (projectId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch prototypes for a project
  const { data: prototypes = [], isLoading } = useQuery({
    queryKey: ['prototypes', projectId],
    queryFn: async () => {
      if (!user || !projectId) return [];
      
      const { data, error } = await supabase
        .from('prototypes')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!projectId,
  });

  // Add prototype mutation
  const addPrototypeMutation = useMutation({
    mutationFn: async (prototypeData: Omit<Prototype, 'id' | 'project_id' | 'created_at'>) => {
      if (!user || !projectId) throw new Error('User not authenticated or project not found');
      
      const { data, error } = await supabase
        .from('prototypes')
        .insert({
          project_id: projectId,
          title: prototypeData.title,
          description: prototypeData.description,
          fidelity: prototypeData.fidelity,
          test_results: prototypeData.test_results,
          next_steps: prototypeData.next_steps,
          files: prototypeData.files || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prototypes', projectId] });
      const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{"showAllNotifications": true}');
      if (settings.showAllNotifications) {
        toast.success('Protótipo criado com sucesso!');
      }
    },
    onError: (error) => {
      console.error('Erro ao criar protótipo:', error);
      const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{"showAllNotifications": true}');
      if (settings.showAllNotifications) {
        toast.error('Erro ao criar protótipo');
      }
    },
  });

  // Update prototype mutation
  const updatePrototypeMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Prototype> }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('prototypes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prototypes', projectId] });
      const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{"showAllNotifications": true}');
      if (settings.showAllNotifications) {
        toast.success('Protótipo atualizado com sucesso!');
      }
    },
    onError: (error) => {
      console.error('Erro ao atualizar protótipo:', error);
      const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{"showAllNotifications": true}');
      if (settings.showAllNotifications) {
        toast.error('Erro ao atualizar protótipo');
      }
    },
  });

  // Delete prototype mutation
  const deletePrototypeMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('prototypes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prototypes', projectId] });
      const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{"showAllNotifications": true}');
      if (settings.showAllNotifications) {
        toast.success('Protótipo removido com sucesso!');
      }
    },
    onError: (error) => {
      console.error('Erro ao remover protótipo:', error);
      const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{"showAllNotifications": true}');
      if (settings.showAllNotifications) {
        toast.error('Erro ao remover protótipo');
      }
    },
  });

  const addPrototype = (prototypeData: Omit<Prototype, 'id' | 'project_id' | 'created_at'>) => {
    addPrototypeMutation.mutate(prototypeData);
  };

  const updatePrototype = (id: string, updates: Partial<Prototype>) => {
    updatePrototypeMutation.mutate({ id, updates });
  };

  const deletePrototype = (id: string) => {
    deletePrototypeMutation.mutate(id);
  };

  return {
    prototypes,
    isLoading,
    addPrototype,
    updatePrototype,
    deletePrototype,
  };
};