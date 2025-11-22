import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Check } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

interface ChecklistEditorProps {
  items: ChecklistItem[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export const ChecklistEditor: React.FC<ChecklistEditorProps> = ({
  items,
  onAdd,
  onToggle,
  onRemove
}) => {
  const [newItemText, setNewItemText] = useState('');

  const handleAdd = () => {
    if (newItemText.trim()) {
      onAdd(newItemText.trim());
      setNewItemText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      {/* Adicionar novo item */}
      <div className="flex gap-2">
        <Input
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite uma nova tarefa..."
          className="flex-1"
        />
        <Button onClick={handleAdd} disabled={!newItemText.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Lista de itens */}
      <div className="space-y-2">
        {items.map(item => (
          <div 
            key={item.id} 
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
              item.done 
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                : 'bg-background border-border hover:bg-muted'
            }`}
          >
            <button
              onClick={() => onToggle(item.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                item.done
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-muted-foreground hover:border-primary'
              }`}
            >
              {item.done && <Check className="w-3 h-3" />}
            </button>
            
            <span className={`flex-1 ${item.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {item.text}
            </span>
            
            <button
              onClick={() => onRemove(item.id)}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors duration-200"
              title="Remover item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-2xl mb-2">📝</div>
          <div>Nenhuma tarefa adicionada ainda.</div>
          <div className="text-sm mt-1">Use o campo acima para adicionar suas primeiras tarefas.</div>
        </div>
      )}
    </div>
  );
};