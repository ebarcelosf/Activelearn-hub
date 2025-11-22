import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChecklistItem {
  id: string;
  project_id: string;
  phase: string;
  text: string;
  done: boolean;
}

export const useChecklistItems = (projectId: string, phase: string) => {
  const queryClient = useQueryClient();

  // Fetch checklist items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['checklist-items', projectId, phase],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('project_id', projectId)
        .eq('phase', phase)
        .order('text', { ascending: true });
      
      if (error) throw error;
      return data as ChecklistItem[];
    },
    enabled: !!projectId && !!phase,
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (text: string) => {
      const { data, error } = await supabase
        .from('checklist_items')
        .insert({ 
          project_id: projectId, 
          phase, 
          text, 
          done: false 
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-items', projectId, phase] });
      toast.success('Item adicionado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro ao adicionar item');
    },
  });

  // Toggle item mutation
  const toggleItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const item = items.find(i => i.id === id);
      if (!item) throw new Error('Item não encontrado');

      const { data, error } = await supabase
        .from('checklist_items')
        .update({ done: !item.done })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-items', projectId, phase] });
    },
    onError: (error) => {
      console.error('Erro ao alterar status do item:', error);
      toast.error('Erro ao alterar status do item');
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-items', projectId, phase] });
      toast.success('Item removido com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao remover item:', error);
      toast.error('Erro ao remover item');
    },
  });

  return {
    items,
    isLoading,
    addItem: (text: string) => addItemMutation.mutate(text),
    toggleItem: (id: string) => toggleItemMutation.mutate(id),
    removeItem: (id: string) => removeItemMutation.mutate(id),
  };
};