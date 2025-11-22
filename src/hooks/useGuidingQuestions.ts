import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GuidingQuestion {
  id: string;
  project_id: string;
  question: string;
  answer?: string;
}

export const useGuidingQuestions = (projectId: string) => {
  const queryClient = useQueryClient();

  // Fetch guiding questions
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['guiding-questions', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guiding_questions')
        .select('*')
        .eq('project_id', projectId)
        .order('question', { ascending: true });
      
      if (error) throw error;
      return data as GuidingQuestion[];
    },
    enabled: !!projectId,
  });

  // Add question mutation
  const addQuestionMutation = useMutation({
    mutationFn: async (question: string) => {
      const { data, error } = await supabase
        .from('guiding_questions')
        .insert({ project_id: projectId, question })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guiding-questions', projectId] });
      toast.success('Pergunta adicionada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao adicionar pergunta:', error);
      toast.error('Erro ao adicionar pergunta');
    },
  });

  // Update answer mutation
  const updateAnswerMutation = useMutation({
    mutationFn: async ({ id, answer }: { id: string; answer: string }) => {
      const { data, error } = await supabase
        .from('guiding_questions')
        .update({ answer })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guiding-questions', projectId] });
      
      // Trigger badge checks after answering questions
      setTimeout(() => {
        const answeredCount = questions.filter(q => q.answer && q.answer.trim()).length + 1;
        
        if (answeredCount === 3) {
          // Trigger badge for 3 questions answered
          window.dispatchEvent(new CustomEvent('badge-trigger', { 
            detail: { trigger: 'questions_answered_3', data: { count: answeredCount } }
          }));
        }
        
        if (answeredCount === 5) {
          // Trigger badge for 5 questions answered
          window.dispatchEvent(new CustomEvent('badge-trigger', { 
            detail: { trigger: 'questions_answered_5', data: { count: answeredCount } }
          }));
        }
      }, 100);
    },
    onError: (error) => {
      console.error('Erro ao atualizar resposta:', error);
      toast.error('Erro ao atualizar resposta');
    },
  });

  // Remove question mutation
  const removeQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('guiding_questions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guiding-questions', projectId] });
      toast.success('Pergunta removida com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao remover pergunta:', error);
      toast.error('Erro ao remover pergunta');
    },
  });

  return {
    questions,
    isLoading,
    addQuestion: (question: string) => addQuestionMutation.mutate(question),
    updateAnswer: (id: string, answer: string) => updateAnswerMutation.mutate({ id, answer }),
    removeQuestion: (id: string) => removeQuestionMutation.mutate(id),
  };
};