import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

interface ChecklistEditorCardProps {
  items: ChecklistItem[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  title?: string;
  description?: string;
}

export const ChecklistEditorCard: React.FC<ChecklistEditorCardProps> = ({
  items,
  onAdd,
  onToggle,
  onRemove,
  title = "Checklist Personalizada",
  description = "Adicione tarefas específicas para esta fase"
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

  const completedCount = items.filter(item => item.done).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {items.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {completedCount}/{items.length} concluídas
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de itens */}
        {items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                <Checkbox
                  id={`item-${item.id}`}
                  checked={item.done}
                  onCheckedChange={() => onToggle(item.id)}
                />
                <label
                  htmlFor={`item-${item.id}`}
                  className={`flex-1 text-sm cursor-pointer ${
                    item.done ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {item.text}
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(item.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Adicionar novo item */}
        <div className="flex gap-2">
          <Input
            placeholder="Digite uma nova tarefa..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleAdd} disabled={!newItemText.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">Nenhuma tarefa adicionada ainda</p>
            <p className="text-xs mt-1">Use o campo acima para adicionar suas próprias tarefas</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};