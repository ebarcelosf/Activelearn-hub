import React, { useState } from 'react';
import { AddQuestionForm } from '@/components/shared/FormComponents';
import { ActivityManager } from '@/components/shared/ActivityManager';
import { ResourceManager } from '@/components/shared/ResourceManager';
import { SynthesisManager } from '@/components/shared/SynthesisManager';
import { ChecklistEditorCard } from '@/components/shared/ChecklistEditorCard';
import { QuestionAnswerField } from './QuestionAnswerField';
import { useBadgeContextOptional } from '@/contexts/BadgeContext';
import { useNudges } from '@/hooks/useNudges';
import { useGuidingQuestions } from '@/hooks/useGuidingQuestions';
import { useActivities } from '@/hooks/useActivities';
import { useResources } from '@/hooks/useResources';
import { useChecklistItems } from '@/hooks/useChecklistItems';
import { NudgeModal } from '@/components/shared/NudgeModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, HelpCircle, Target, BookOpen, Search, CheckCircle, X, Rocket } from 'lucide-react';

interface InvestigatePaneProps {
  data: any;
  update: (field: string, value: any) => void;
  onPhaseTransition?: (phase: string) => void;
}

export const InvestigatePane: React.FC<InvestigatePaneProps> = ({ data, update, onPhaseTransition }) => {
  const [activeSection, setActiveSection] = useState('guiding-questions');
  const badge = useBadgeContextOptional();
  const checkTrigger = badge?.checkTrigger ?? (() => {});
  const { isModalOpen, currentCategory, currentPhase, openNudgeModal, closeModal } = useNudges();
  
  // Use database hooks for separate entities
  const { questions, addQuestion, updateAnswer, removeQuestion } = useGuidingQuestions(data.id);
  const { activities, addActivity, updateActivity, toggleStatus, removeActivity } = useActivities(data.id);
  const { resources, addResource, updateResource, removeResource } = useResources(data.id);
  const { items: checklistItems, addItem, toggleItem, removeItem } = useChecklistItems(data.id, 'investigate');

  // Função wrapper que será chamada após o debounce
  function handleAnswerUpdate(questionId: string, answer: string) {
    updateAnswer(questionId, answer);
    
    // Verificar badges de perguntas respondidas
    const answeredCount = questions.filter(q => q.answer && q.answer.trim().length > 0).length;
    if (answeredCount === 1) {
      checkTrigger('first_question_answered');
    } else if (answeredCount === 3) {
      checkTrigger('questions_answered_3', { questionsAnswered: answeredCount });
    } else if (answeredCount === 5) {
      checkTrigger('questions_answered_5', { questionsAnswered: answeredCount });
    }
  }

  function handleAddQuestion(text: string) {
    if (!text.trim()) return;
    addQuestion(text.trim());
  }

  function handleRemoveQuestion(questionId: string) {
    removeQuestion(questionId);
  }

  // Trigger badges for activities
  const handleAddActivity = (activityData: any) => {
    // Ensure only DB-allowed fields are sent
    addActivity({
      title: activityData.title,
      description: activityData.description,
      type: activityData.type,
      status: activityData.status || 'planned',
      notes: activityData.notes,
    });
    
    // Trigger badge de primeira atividade
    if ((activities?.length || 0) === 0) {
      checkTrigger('activity_created');
    }
  };

  // Trigger badges for resources
  const handleAddResource = (resourceData: any) => {
    // Ensure only DB-allowed fields are sent
    addResource({
      title: resourceData.title,
      url: resourceData.url,
      type: resourceData.type,
      credibility: resourceData.credibility,
      notes: resourceData.notes,
      tags: resourceData.tags,
    });
    
    // Badge triggers for resources
    const currentCount = resources?.length || 0;
    checkTrigger('resources_added', { resourcesCount: currentCount + 1 });
    if (currentCount + 1 >= 3) {
      checkTrigger('multiple_resources_collected', { resourcesCount: currentCount + 1 });
    }
  };

  function updateSynthesis(field: string, value: any) {
    const synthesis = { ...data.synthesis, [field]: value };
    update('synthesis', synthesis);
  }

  function markComplete() {
    if (!canComplete) {
      return alert('Para concluir, adicione: 1 pergunta, 1 atividade, 1 recurso e escreva a síntese.');
    }
    // Marcar fase como concluída
    update('investigateCompleted', true);
    update('phase', 'act');
    checkTrigger('investigate_completed', { questionsAnswered: answeredCount });
    
    // Marcar todos os itens da checklist da fase como concluídos
    checklistItems.forEach(item => {
      if (!item.done) {
        toggleItem(item.id);
      }
    });
    
    // Navegar para a próxima fase
    if (onPhaseTransition) {
      onPhaseTransition('act');
    }
  }

  // Verificar conclusão das seções
  const synthesis = data.synthesis || {};
  const answeredCount = questions.filter(q => q.answer && q.answer.trim().length > 0).length;
  const questionsCount = questions.length;
  
  // Critérios de conclusão: 1 pergunta, 1 atividade, 1 recurso e síntese preenchida
  const hasQuestion = questionsCount >= 1;
  const hasActivities = activities.length >= 1;
  const hasResources = resources.length >= 1;
  const hasSynthesis = !!(synthesis.mainFindings || '').trim();
  const sectionsCompleted = [hasQuestion, hasActivities, hasResources, hasSynthesis].filter(Boolean).length;
  const canComplete = sectionsCompleted === 4;

  const sections = [
    {
      id: 'guiding-questions',
      title: 'Guiding Questions',
      icon: HelpCircle,
      description: 'Perguntas-guia para orientar sua pesquisa',
      completed: hasQuestion,
      count: (questionsCount).toString()
    },
    {
      id: 'guiding-activities',
      title: 'Guiding Activities',
      icon: Target,
      description: 'Atividades práticas para coletar dados',
      completed: hasActivities,
      count: activities.length.toString()
    },
    {
      id: 'guiding-resources',
      title: 'Guiding Resources',
      icon: BookOpen,
      description: 'Colete artigos, vídeos e entrevistas',
      completed: hasResources,
      count: resources.length.toString()
    },
    {
      id: 'research-synthesis',
      title: 'Research Synthesis',
      icon: Search,
      description: 'Resumir os principais insights obtidos',
      completed: hasSynthesis
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
                  ? 'ring-2 ring-secondary border-secondary/50 shadow-lg'
                  : 'hover:border-secondary/30'
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${
                    activeSection === section.id 
                      ? 'bg-secondary text-secondary-foreground' 
                      : 'bg-secondary/10 text-secondary'
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
                <CardDescription className="text-xs mb-3 leading-relaxed">{section.description}</CardDescription>
                {section.count && (
                  <Badge variant="outline" className="text-xs">
                    {section.count} {section.count === '1' ? 'item' : 'itens'}
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conteúdo das Seções */}
      <div className="space-y-6">
        {activeSection === 'guiding-questions' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-secondary" />
                    Guiding Questions
                  </CardTitle>
                  <CardDescription>
                    Perguntas-guia para orientar sua pesquisa
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openNudgeModal('Investigate', 'Guiding Questions')}
                  className="flex items-center gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  Obter Nudges
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.length === 0 && (
                <Card className="text-center py-8 border-dashed">
                  <CardContent>
                    <div className="flex justify-center mb-4">
                      <div className="p-4 rounded-full bg-secondary/10">
                        <HelpCircle className="w-8 h-8 text-secondary" />
                      </div>
                    </div>
                    <CardTitle className="mb-2">Nenhuma pergunta adicionada ainda</CardTitle>
                    <CardDescription>
                      Use o campo abaixo para adicionar sua primeira pergunta-guia
                    </CardDescription>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {questions.map((question) => (
                  <Card key={question.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base flex-1">{question.question}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQuestion(question.id)}
                          className="text-destructive hover:text-destructive ml-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <QuestionAnswerField
                        questionId={question.id}
                        answer={question.answer || ''}
                        onUpdate={handleAnswerUpdate}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6">
                <AddQuestionForm onAdd={handleAddQuestion} />
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === 'guiding-activities' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Guiding Activities</div>
                <div className="text-muted-foreground text-sm mt-1">Atividades práticas para coletar dados e informações</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNudgeModal('Investigate', 'Guiding Activities')}
                className="flex items-center gap-1 text-xs"
              >
                <Lightbulb className="h-3 w-3" />
                Obter Nudges
              </Button>
            </div>
            <ActivityManager
              activities={activities}
              onAdd={handleAddActivity}
              onUpdate={updateActivity}
              onRemove={removeActivity}
              onToggleStatus={toggleStatus}
              title=""
              description=""
            />
          </div>
        )}

        {activeSection === 'guiding-resources' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Guiding Resources</div>
                <div className="text-muted-foreground text-sm mt-1">Colete artigos, vídeos e entrevistas relevantes</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNudgeModal('Investigate', 'Guiding Resources')}
                className="flex items-center gap-1 text-xs"
              >
                <Lightbulb className="h-3 w-3" />
                Obter Nudges
              </Button>
            </div>
            <ResourceManager
              resources={resources}
              onAdd={handleAddResource}
              onUpdate={updateResource}
              onRemove={removeResource}
              title=""
              description=""
              checkTrigger={checkTrigger}
            />
          </div>
        )}

        {activeSection === 'research-synthesis' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Research Synthesis</div>
                <div className="text-muted-foreground text-sm mt-1">Resuma os principais insights e padrões descobertos</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNudgeModal('Investigate', 'Research Synthesis')}
                className="flex items-center gap-1 text-xs"
              >
                <Lightbulb className="h-3 w-3" />
                Obter Nudges
              </Button>
            </div>
            <SynthesisManager
              synthesis={synthesis}
              onUpdate={updateSynthesis}
              questions={data.guidingQuestions || []}
              answers={data.answers || []}
              resources={resources}
              activities={activities}
              title=""
              description=""
            />
          </div>
        )}

        {/* Checklist Personalizada */}
        <ChecklistEditorCard
          items={checklistItems.map(item => ({ id: item.id, text: item.text, done: item.done }))}
          onAdd={addItem}
          onToggle={(id: string) => toggleItem(id)}
          onRemove={(id: string) => removeItem(id)}
          title="Checklist da Fase Investigate"
          description="Adicione tarefas específicas para esta fase"
        />

        {/* Botão de Conclusão */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold">Concluir Fase Investigate</h3>
                <p className="text-sm text-muted-foreground">
                  Para avançar: adicione 1 pergunta, 1 atividade, 1 recurso e escreva a síntese
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Badge variant={data.investigateCompleted ? "default" : "secondary"} className="flex items-center gap-1">
                  {data.investigateCompleted ? (
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
                  disabled={!canComplete}
                  size="lg"
                  className={`flex items-center gap-2 ${!canComplete ? "opacity-60" : ""}`}
                >
                  {canComplete ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Concluir Fase e Avançar para Act
                    </>
                  ) : (
                    'Requisitos pendentes'
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