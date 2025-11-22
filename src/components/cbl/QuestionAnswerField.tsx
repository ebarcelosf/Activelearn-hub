import React from 'react';
import { useDebouncedUpdate } from '@/hooks/useDebouncedUpdate';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface QuestionAnswerFieldProps {
  questionId: string;
  answer: string;
  onUpdate: (questionId: string, answer: string) => void;
}

export const QuestionAnswerField: React.FC<QuestionAnswerFieldProps> = ({
  questionId,
  answer,
  onUpdate
}) => {
  const [localAnswer, setLocalAnswer] = useDebouncedUpdate({
    initialValue: answer || '',
    onUpdate: (_, value) => onUpdate(questionId, value),
    field: 'answer'
  });

  return (
    <>
      <textarea
        value={localAnswer}
        onChange={(e) => setLocalAnswer(e.target.value)}
        placeholder="Digite sua resposta aqui..."
        rows={3}
        className="w-full p-3 rounded-lg bg-background border text-foreground focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
      />
      {localAnswer.trim().length > 0 && (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Respondida ({localAnswer.trim().length} caracteres)
        </Badge>
      )}
    </>
  );
};
