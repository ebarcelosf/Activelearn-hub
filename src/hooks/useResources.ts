import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Resource {
  id: string;
  project_id: string;
  title: string;
  url: string;
  type: string;
  credibility: number;
  notes?: string;
  tags: string[];
  createdAt: string;
}

export const useResources = (projectId: string) => {
  const queryClient = useQueryClient();

  // Fetch resources
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      // Map database fields to component interface
      return data.map(item => ({
        ...item,
        createdAt: item.created_at,
        credibility: parseInt(item.credibility || '1'),
        tags: item.tags || [],
        url: item.url || '',
        type: item.type || ''
      })) as Resource[];
    },
    enabled: !!projectId,
  });

  // Add resource mutation
  const addResourceMutation = useMutation({
    mutationFn: async (resourceData: Omit<Resource, 'id' | 'project_id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('resources')
        .insert({ 
          ...resourceData, 
          project_id: projectId,
          credibility: resourceData.credibility?.toString() || '1'
        })
        .select()
        .single();
      
      if (error) throw error;
      return {
        ...data,
        createdAt: data.created_at,
        credibility: parseInt(data.credibility || '1'),
        tags: data.tags || [],
        url: data.url || '',
        type: data.type || ''
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources', projectId] });
      toast.success('Recurso adicionado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao adicionar recurso:', error);
      toast.error('Erro ao adicionar recurso');
    },
  });

  // Update resource mutation
  const updateResourceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Resource> }) => {
      // Convert component interface to database interface
      const dbUpdates = {
        ...updates,
        created_at: updates.createdAt,
        credibility: updates.credibility?.toString()
      };
      delete (dbUpdates as any).createdAt;

      const { data, error } = await supabase
        .from('resources')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return {
        ...data,
        createdAt: data.created_at,
        credibility: parseInt(data.credibility || '1'),
        tags: data.tags || [],
        url: data.url || '',
        type: data.type || ''
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources', projectId] });
      toast.success('Recurso atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar recurso:', error);
      toast.error('Erro ao atualizar recurso');
    },
  });

  // Remove resource mutation
  const removeResourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources', projectId] });
      toast.success('Recurso removido com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao remover recurso:', error);
      toast.error('Erro ao remover recurso');
    },
  });

  return {
    resources,
    isLoading,
    addResource: (resourceData: Omit<Resource, 'id' | 'project_id' | 'createdAt'>) => 
      addResourceMutation.mutate(resourceData),
    updateResource: (id: string, updates: Partial<Resource>) => 
      updateResourceMutation.mutate({ id, updates }),
    removeResource: (id: string) => removeResourceMutation.mutate(id),
  };
};