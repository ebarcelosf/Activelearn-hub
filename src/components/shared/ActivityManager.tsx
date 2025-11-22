import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit, Check, Clock, PlayCircle } from 'lucide-react';
import { LucideIcon } from './LucideIcon';
import { v4 as uuidv4 } from 'uuid';

interface Activity {
  id: string;
  title: string;
  description: string;
  type: string;
  status: 'planned' | 'in-progress' | 'completed';
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

interface ActivityManagerProps {
  activities: Activity[];
  onAdd: (activity: Activity) => void;
  onUpdate: (id: string, updatedData: Partial<Activity>) => void;
  onRemove: (id: string) => void;
  onToggleStatus: (id: string) => void;
  title: string;
  description: string;
}

export const ActivityManager: React.FC<ActivityManagerProps> = ({
  activities,
  onAdd,
  onUpdate,
  onRemove,
  onToggleStatus,
  title,
  description
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'interview',
    notes: ''
  });

  const activityTypes = [
    { value: 'interview', label: 'Entrevista' },
    { value: 'survey', label: 'Pesquisa' },
    { value: 'observation', label: 'Observação' },
    { value: 'research', label: 'Pesquisa Bibliográfica' },
    { value: 'experiment', label: 'Experimento' },
    { value: 'other', label: 'Outro' }
  ];

  const statusConfig = {
    'planned': { icon: Clock, label: 'Planejada', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
    'in-progress': { icon: PlayCircle, label: 'Em Progresso', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
    'completed': { icon: Check, label: 'Concluída', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingId) {
      onUpdate(editingId, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        notes: formData.notes
      });
      setEditingId(null);
    } else {
      const newActivity: Activity = {
        id: uuidv4(),
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: 'planned',
        notes: formData.notes,
        createdAt: new Date().toISOString()
      };
      onAdd(newActivity);
      setIsAdding(false);
    }

    setFormData({ title: '', description: '', type: 'interview', notes: '' });
  };

  const handleEdit = (activity: Activity) => {
    setFormData({
      title: activity.title,
      description: activity.description,
      type: activity.type,
      notes: activity.notes || ''
    });
    setEditingId(activity.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ title: '', description: '', type: 'interview', notes: '' });
  };

  return (
    <div className="space-y-6">
      {!isAdding && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <LucideIcon name="Target" className="w-4 h-4 text-primary" />
              </div>
              Atividades de Pesquisa
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Planeje e execute atividades para coletar dados</p>
          </div>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Atividade
          </Button>
        </div>
      )}

      {/* Formulário de adição/edição */}
      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? 'Editar Atividade' : 'Nova Atividade'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Entrevistar estudantes sobre hábitos alimentares"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o objetivo e como será realizada..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notas</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações adicionais..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? 'Salvar' : 'Adicionar'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de atividades */}
      <div className="space-y-4">
        {activities.map(activity => {
          const statusInfo = statusConfig[activity.status as keyof typeof statusConfig] ?? statusConfig['planned'];
          const StatusIcon = statusInfo.icon;
          const typeLabel = activityTypes.find(t => t.value === activity.type)?.label || activity.type;

          return (
            <Card key={activity.id} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-2">{activity.title}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge variant="outline">{typeLabel}</Badge>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleStatus(activity.id)}
                      title="Alterar status"
                    >
                      <StatusIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(activity)}
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemove(activity.id)}
                      className="text-destructive hover:text-destructive"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {(activity.description || activity.notes) && (
                <CardContent className="pt-0">
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                  )}
                  {activity.notes && (
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      <span className="font-medium">Notas:</span> {activity.notes}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {activities.length === 0 && !isAdding && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
              <LucideIcon name="Target" className="w-10 h-10 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">Nenhuma atividade planejada ainda</CardTitle>
            <CardDescription>
              Clique em "Nova Atividade" para começar a planejar suas pesquisas
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
};