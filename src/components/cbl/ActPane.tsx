import React, { useState } from 'react';
import { SolutionManager } from '@/components/shared/SolutionManager';
import { ImplementationManager } from '@/components/shared/ImplementationManager';
import { EvaluationManager } from '@/components/shared/EvaluationManager';
import { PrototypeManager } from '@/components/shared/PrototypeManager';
import { ChecklistEditorCard } from '@/components/shared/ChecklistEditorCard';
import { useBadgeContextOptional } from '@/contexts/BadgeContext';
import { useNudges } from '@/hooks/useNudges';
import { NudgeModal } from '@/components/shared/NudgeModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, Rocket, BarChart3, Wrench, CheckCircle } from 'lucide-react';
import { useChecklistItems } from '@/hooks/useChecklistItems';
import { usePrototypes } from '@/hooks/usePrototypes';

interface ActPaneProps {
  data: any;
  update: (field: string, value: any) => void;
  onPhaseTransition?: (phase: string) => void;
}

export const ActPane: React.FC<ActPaneProps> = ({ data, update, onPhaseTransition }) => {
  const [activeSection, setActiveSection] = useState('solution-development');
  const badge = useBadgeContextOptional();
  const checkTrigger = badge?.checkTrigger ?? (() => {});
  const { isModalOpen, currentCategory, currentPhase, openNudgeModal, closeModal } = useNudges();

  // Atualizar dados da solução
  function updateSolution(field: string, value: any) {
    const solution = { ...data.solution, [field]: value };
    update('solution', solution);
  }

  // Atualizar dados da implementação
  function updateImplementation(field: string, value: any) {
    const implementation = { ...data.implementation, [field]: value };
    update('implementation', implementation);
  }

  // Atualizar dados da avaliação
  function updateEvaluation(field: string, value: any) {
    const evaluation = { ...data.evaluation, [field]: value };
    update('evaluation', evaluation);
  }

  // Use prototypes hook for database operations
  const { prototypes: dbPrototypes, addPrototype: addDbPrototype, updatePrototype: updateDbPrototype, deletePrototype: deleteDbPrototype } = usePrototypes(data.id);

  // Adicionar protótipo
  function addPrototype(prototype: any) {
    // Save to database
    addDbPrototype({
      title: prototype.title,
      description: prototype.description,
      fidelity: prototype.fidelity,
      test_results: prototype.testResults,
      next_steps: prototype.nextSteps,
      files: prototype.files || [],
    });
    
    // Trigger badges based on current count + 1
    const newCount = dbPrototypes.length + 1;
    if (newCount === 1) {
      checkTrigger('prototype_created');
    }
    if (newCount >= 3) {
      checkTrigger('multiple_prototypes_created', { prototypesCount: newCount });
    }
  }

  // Atualizar protótipo
  function updatePrototype(id: string, updatedData: any) {
    updateDbPrototype(id, {
      title: updatedData.title,
      description: updatedData.description,
      fidelity: updatedData.fidelity,
      test_results: updatedData.testResults,
      next_steps: updatedData.nextSteps,
      files: updatedData.files || [],
    });
  }

  // Remover protótipo
  function removePrototype(id: string) {
    deleteDbPrototype(id);
  }

  const {
    items: actChecklist,
    addItem: addActItem,
    toggleItem: toggleActItem,
    removeItem: removeActItem
  } = useChecklistItems(data.id, 'act');

  function markComplete() {
    // Verificar se todos os requisitos básicos foram atendidos
    const hasBasicSolution = !!(data.solution?.description || '').trim();
  const hasPrototypes = dbPrototypes.length >= 1;
    const hasImplementationPlan = !!(data.implementation?.overview || '').trim();
    const hasEvaluationCriteria = !!(data.evaluation?.objectives || '').trim();

    if (!hasBasicSolution) return alert('É necessário descrever a solução no "Solution Development".');
    if (!hasPrototypes) return alert('É necessário criar pelo menos 1 protótipo.');
    if (!hasImplementationPlan) return alert('É necessário definir um plano de implementação.');
    if (!hasEvaluationCriteria) return alert('É necessário estabelecer critérios de avaliação.');

    update('actCompleted', true);
    
    // Trigger badges de conclusão
    checkTrigger('act_completed');
    
    // Transição para fase de conclusão
    if (onPhaseTransition) {
      onPhaseTransition('completed');
    }
    
    // Marcar todos os itens da checklist da fase como concluídos no banco
    actChecklist.forEach(item => {
      if (!item.done) {
        toggleActItem(item.id);
      }
    });
  }

  // Verificar conclusão das seções
  const hasSolution = !!(data.solution?.description || '').trim();
  const hasImplementation = !!(data.implementation?.overview || '').trim();
  const hasEvaluation = !!(data.evaluation?.objectives || '').trim();
  const hasPrototypes = dbPrototypes.length > 0;
  const sectionsCompleted = [hasSolution, hasImplementation, hasEvaluation, hasPrototypes].filter(Boolean).length;

  const sections = [
    {
      id: 'solution-development',
      title: 'Solution Development',
      icon: Target,
      description: 'Desenvolva soluções concretas e inovadoras',
      completed: !!(data.solution?.description || '').trim()
    },
    {
      id: 'implementation',
      title: 'Implementation',
      icon: Rocket,
      description: 'Crie protótipos testáveis e planos de implementação',
      completed: !!(data.implementation?.overview || '').trim()
    },
    {
      id: 'evaluation',
      title: 'Evaluation',
      icon: BarChart3,
      description: 'Estabeleça planos de avaliação e métricas de sucesso',
      completed: !!(data.evaluation?.objectives || '').trim()
    },
    {
      id: 'prototypes',
      title: 'Prototypes',
      icon: Wrench,
      description: 'Crie e teste protótipos funcionais',
      completed: dbPrototypes.length > 0
    }
  ];

  return (
    <div className="space-y-8">
      {/* Navegação das Seções */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map(section => {
          const IconComponent = section.icon;
          return (
            <Card 
              key={section.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
                activeSection === section.id
                  ? 'ring-2 ring-accent border-accent/50 shadow-lg'
                  : 'hover:border-accent/30'
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${
                    activeSection === section.id 
                      ? 'bg-accent text-accent-foreground' 
                      : 'bg-accent/10 text-accent'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    section.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-border'
                  }`}>
                    {section.completed && <CheckCircle className="w-3 h-3" />}
                  </div>
                </div>
                <CardTitle className="text-sm mb-2">{section.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">{section.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conteúdo das Seções */}
      <div className="space-y-6">
        {activeSection === 'solution-development' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Solution Development</div>
                <div className="text-muted-foreground text-sm mt-1">Desenvolva soluções concretas e inovadoras para seu desafio</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNudgeModal('Act', 'Solution Development')}
                className="flex items-center gap-1 text-xs"
              >
                <Lightbulb className="h-3 w-3" />
                Obter Nudges
              </Button>
            </div>
            <SolutionManager
              solution={data.solution || {}}
              onUpdate={updateSolution}
              title=""
              description=""
            />
          </div>
        )}

        {activeSection === 'implementation' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Implementation Plan</div>
                <div className="text-muted-foreground text-sm mt-1">Defina como sua solução será construída e implementada</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNudgeModal('Act', 'Implementation')}
                className="flex items-center gap-1 text-xs"
              >
                <Lightbulb className="h-3 w-3" />
                Obter Nudges
              </Button>
            </div>
            <ImplementationManager
              implementation={data.implementation || {}}
              onUpdate={updateImplementation}
              title=""
              description=""
            />
          </div>
        )}

        {activeSection === 'evaluation' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Evaluation Criteria</div>
                <div className="text-muted-foreground text-sm mt-1">Estabeleça como medir o sucesso da sua solução</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNudgeModal('Act', 'Evaluation')}
                className="flex items-center gap-1 text-xs"
              >
                <Lightbulb className="h-3 w-3" />
                Obter Nudges
              </Button>
            </div>
            <EvaluationManager
              evaluation={data.evaluation || {}}
              onUpdate={updateEvaluation}
              title=""
              description=""
            />
          </div>
        )}

        {activeSection === 'prototypes' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Prototypes</div>
                <div className="text-muted-foreground text-sm mt-1">Crie e teste protótipos da sua solução</div>
              </div>
            </div>
            <PrototypeManager
              prototypes={dbPrototypes.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description || '',
                fidelity: (p.fidelity as 'low' | 'medium' | 'high') || 'low',
                testResults: p.test_results || '',
                nextSteps: p.next_steps || '',
                files: p.files || [],
                createdAt: p.created_at
              }))}
              onAdd={addPrototype}
              onUpdate={updatePrototype}
              onRemove={removePrototype}
              title=""
              description=""
            />
          </div>
        )}

        {/* Checklist Personalizada */}
        <ChecklistEditorCard
          items={actChecklist.map(item => ({ id: item.id, text: item.text, done: item.done }))}
          onAdd={addActItem}
          onToggle={toggleActItem}
          onRemove={removeActItem}
          title="Checklist da Fase Act"
          description="Adicione tarefas específicas para esta fase"
        />

        {/* Botão de Conclusão */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold">Concluir Fase Act</h3>
                <p className="text-sm text-muted-foreground">
                  Complete todas as seções para finalizar o ciclo CBL
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Badge variant={data.actCompleted ? "default" : "secondary"} className="flex items-center gap-1">
                  {data.actCompleted ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Concluído
                    </>
                  ) : (
                    `${sectionsCompleted}/4 seções`
                  )}
                </Badge>
                <Button
                  onClick={markComplete} 
                  disabled={sectionsCompleted < 4}
                  size="lg"
                  className={`flex items-center gap-2 ${sectionsCompleted < 4 ? "opacity-60" : ""}`}
                >
                  {sectionsCompleted >= 4 ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Marcar Act como concluído
                    </>
                  ) : (
                    'Complete todas as seções para finalizar'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <NudgeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        category={currentCategory}
        phase={currentPhase}
      />
    </div>
  );
};