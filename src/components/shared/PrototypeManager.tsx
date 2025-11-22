import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit, Lightbulb, TestTube, Layers } from 'lucide-react';
import { LucideIcon } from './LucideIcon';
import { v4 as uuidv4 } from 'uuid';

interface Prototype {
  id: string;
  title: string;
  description: string;
  fidelity: 'low' | 'medium' | 'high';
  testResults?: string;
  nextSteps?: string;
  files: string[];
  createdAt: string;
}

interface PrototypeManagerProps {
  prototypes: Prototype[];
  onAdd: (prototype: Prototype) => void;
  onUpdate: (id: string, updatedData: Partial<Prototype>) => void;
  onRemove: (id: string) => void;
  title: string;
  description: string;
}

export const PrototypeManager: React.FC<PrototypeManagerProps> = ({
  prototypes,
  onAdd,
  onUpdate,
  onRemove,
  title,
  description
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fidelity: 'low' as 'low' | 'medium' | 'high',
    testResults: '',
    nextSteps: '',
    files: ''
  });

  const fidelityOptions = [
    { value: 'low', label: 'Baixa Fidelidade', icon: Lightbulb, description: 'Esboços, wireframes, mockups simples' },
    { value: 'medium', label: 'Média Fidelidade', icon: Layers, description: 'Protótipos interativos, designs detalhados' },
    { value: 'high', label: 'Alta Fidelidade', icon: TestTube, description: 'Versões funcionais, próximas ao produto final' }
  ];

  const fidelityConfig = {
    'low': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: Lightbulb },
    'medium': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: Layers },
    'high': { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: TestTube }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const prototypeData = {
      title: formData.title,
      description: formData.description,
      fidelity: formData.fidelity,
      testResults: formData.testResults,
      nextSteps: formData.nextSteps,
      files: formData.files.split(',').map(file => file.trim()).filter(file => file)
    };

    if (editingId) {
      onUpdate(editingId, prototypeData);
      setEditingId(null);
    } else {
      const newPrototype: Prototype = {
        id: uuidv4(),
        ...prototypeData,
        createdAt: new Date().toISOString()
      };
      onAdd(newPrototype);
      setIsAdding(false);
    }

    setFormData({ title: '', description: '', fidelity: 'low', testResults: '', nextSteps: '', files: '' });
  };

  const handleEdit = (prototype: Prototype) => {
    setFormData({
      title: prototype.title,
      description: prototype.description,
      fidelity: prototype.fidelity,
      testResults: prototype.testResults || '',
      nextSteps: prototype.nextSteps || '',
      files: prototype.files.join(', ')
    });
    setEditingId(prototype.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ title: '', description: '', fidelity: 'low', testResults: '', nextSteps: '', files: '' });
  };

  return (
    <div className="space-y-6">
      {!isAdding && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <LucideIcon name="Wrench" className="w-4 h-4 text-primary" />
              </div>
              Protótipos
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Crie e teste protótipos da sua solução</p>
          </div>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Protótipo
          </Button>
        </div>
      )}

      {/* Dicas sobre prototipagem */}
      <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-semibold">💡 Dicas para Prototipagem:</span>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• <strong>Baixa Fidelidade:</strong> Foque no conceito e fluxo básico</li>
              <li>• <strong>Média Fidelidade:</strong> Adicione interatividade e design</li>
              <li>• <strong>Alta Fidelidade:</strong> Simule a experiência real do usuário</li>
              <li>• <strong>Teste cedo e frequentemente</strong> com usuários reais</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de adição/edição */}
      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? 'Editar Protótipo' : 'Novo Protótipo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Protótipo</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Interface inicial do aplicativo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nível de Fidelidade</label>
                <Select value={formData.fidelity} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, fidelity: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fidelityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o que este protótipo testa ou demonstra..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Resultados dos Testes</label>
                <Textarea
                  value={formData.testResults}
                  onChange={(e) => setFormData({ ...formData, testResults: e.target.value })}
                  placeholder="O que você descobriu testando este protótipo? Feedback dos usuários, problemas identificados..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Próximos Passos</label>
                <Textarea
                  value={formData.nextSteps}
                  onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
                  placeholder="Baseado nos testes, quais são as próximas iterações ou melhorias necessárias?"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Arquivos/Links (separados por vírgula)</label>
                <Input
                  value={formData.files}
                  onChange={(e) => setFormData({ ...formData, files: e.target.value })}
                  placeholder="links para Figma, PDFs, imagens, etc."
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

      {/* Lista de protótipos */}
      <div className="space-y-4">
        {prototypes.map(prototype => {
          const FidelityIcon = fidelityConfig[prototype.fidelity].icon;
          const fidelityLabel = fidelityOptions.find(opt => opt.value === prototype.fidelity)?.label;

          return (
            <Card key={prototype.id} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-2">{prototype.title}</CardTitle>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={fidelityConfig[prototype.fidelity].color}>
                        <FidelityIcon className="w-3 h-3 mr-1" />
                        {fidelityLabel}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(prototype.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {prototype.files.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        📎 {prototype.files.length} arquivo(s) anexado(s)
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(prototype)}
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemove(prototype.id)}
                      className="text-destructive hover:text-destructive"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {prototype.description && (
                  <div>
                    <span className="text-sm font-medium">Descrição:</span>
                    <p className="text-sm text-muted-foreground mt-1">{prototype.description}</p>
                  </div>
                )}
                {prototype.testResults && (
                  <div className="bg-muted p-3 rounded-lg">
                    <span className="text-sm font-medium">Resultados dos Testes:</span>
                    <p className="text-sm text-muted-foreground mt-1">{prototype.testResults}</p>
                  </div>
                )}
                {prototype.nextSteps && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Próximos Passos:</span>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{prototype.nextSteps}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {prototypes.length === 0 && !isAdding && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
              <LucideIcon name="Wrench" className="w-10 h-10 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">Nenhum protótipo criado ainda</CardTitle>
            <CardDescription>
              Clique em "Novo Protótipo" para começar a testar suas ideias
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
};