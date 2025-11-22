import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit, ExternalLink, Star } from 'lucide-react';
import { LucideIcon } from './LucideIcon';
import { v4 as uuidv4 } from 'uuid';

interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
  credibility: number;
  notes?: string;
  tags: string[];
  createdAt: string;
}

interface ResourceManagerProps {
  resources: Resource[];
  onAdd: (resource: Resource) => void;
  onUpdate: (id: string, updatedData: Partial<Resource>) => void;
  onRemove: (id: string) => void;
  title: string;
  description: string;
  checkTrigger?: (trigger: string, data?: any) => void;
}

export const ResourceManager: React.FC<ResourceManagerProps> = ({
  resources,
  onAdd,
  onUpdate,
  onRemove,
  title,
  description,
  checkTrigger
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    type: 'article',
    credibility: 3,
    notes: '',
    tags: ''
  });

  const resourceTypes = [
    { value: 'article', label: 'Artigo' },
    { value: 'video', label: 'Vídeo' },
    { value: 'book', label: 'Livro' },
    { value: 'website', label: 'Website' },
    { value: 'document', label: 'Documento' },
    { value: 'other', label: 'Outro' }
  ];

  const credibilityLabels = {
    1: 'Muito Baixa',
    2: 'Baixa',
    3: 'Média',
    4: 'Alta',
    5: 'Muito Alta'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) return;

    const resourceData = {
      title: formData.title,
      url: formData.url,
      type: formData.type,
      credibility: formData.credibility,
      notes: formData.notes,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    if (editingId) {
      onUpdate(editingId, resourceData);
      setEditingId(null);
      // Trigger badge check after updating
      if (checkTrigger) {
        checkTrigger('multiple_resources_collected', { resourcesCount: resources.length });
      }
    } else {
      const newResource: Resource = {
        id: uuidv4(),
        ...resourceData,
        createdAt: new Date().toISOString()
      };
      onAdd(newResource);
      setIsAdding(false);
      // Trigger badge check after adding new resource
      if (checkTrigger) {
        const newResourcesCount = resources.length + 1;
        checkTrigger('multiple_resources_collected', { resourcesCount: newResourcesCount });
      }
    }

    setFormData({ title: '', url: '', type: 'article', credibility: 3, notes: '', tags: '' });
  };

  const handleEdit = (resource: Resource) => {
    setFormData({
      title: resource.title,
      url: resource.url,
      type: resource.type,
      credibility: resource.credibility,
      notes: resource.notes || '',
      tags: resource.tags.join(', ')
    });
    setEditingId(resource.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ title: '', url: '', type: 'article', credibility: 3, notes: '', tags: '' });
  };

  const renderStars = (credibility: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < credibility ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {!isAdding && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <LucideIcon name="BookOpen" className="w-4 h-4 text-primary" />
              </div>
              Recursos de Pesquisa
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Colete e organize materiais relevantes para sua pesquisa</p>
          </div>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Recurso
          </Button>
        </div>
      )}

      {/* Formulário de adição/edição */}
      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? 'Editar Recurso' : 'Novo Recurso'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Pesquisa sobre sustentabilidade alimentar"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL</label>
                <Input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
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
                      {resourceTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Credibilidade ({credibilityLabels[formData.credibility as keyof typeof credibilityLabels]})
                  </label>
                  <Select 
                    value={formData.credibility.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, credibility: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(credibilityLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (separadas por vírgula)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Ex: sustentabilidade, alimentação, jovens"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notas</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Resumo do conteúdo e insights relevantes..."
                  rows={3}
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

      {/* Lista de recursos */}
      <div className="space-y-4">
        {resources.map(resource => {
          const typeLabel = resourceTypes.find(t => t.value === resource.type)?.label || resource.type;

          return (
            <Card key={resource.id} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-2">{resource.title}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                      <Badge variant="outline">{typeLabel}</Badge>
                      <div className="flex items-center gap-1">
                        {renderStars(resource.credibility)}
                        <span className="ml-1 text-xs">({credibilityLabels[resource.credibility as keyof typeof credibilityLabels]})</span>
                      </div>
                    </div>
                    {resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {resource.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(resource.url, '_blank')}
                      title="Abrir link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(resource)}
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemove(resource.id)}
                      className="text-destructive hover:text-destructive"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {resource.notes && (
                <CardContent className="pt-0">
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {resource.notes}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {resources.length === 0 && !isAdding && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
              <LucideIcon name="BookOpen" className="w-10 h-10 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">Nenhum recurso coletado ainda</CardTitle>
            <CardDescription>
              Clique em "Novo Recurso" para começar a coletar materiais para sua pesquisa
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
};