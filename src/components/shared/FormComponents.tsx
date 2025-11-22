import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, HelpCircle } from 'lucide-react';

interface AddQuestionFormProps {
  onAdd: (text: string) => void;
}

export const AddQuestionForm: React.FC<AddQuestionFormProps> = ({ onAdd }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onAdd(question.trim());
      setQuestion('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card p-4 rounded-lg border border-border">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Nova pergunta-guia
        </label>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ex: Quais são as principais causas deste problema na nossa comunidade?"
          rows={2}
          className="resize-none"
        />
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Dica: Faça perguntas abertas que guiem sua investigação
          </div>
          <Button type="submit" disabled={!question.trim()} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>
    </form>
  );
};