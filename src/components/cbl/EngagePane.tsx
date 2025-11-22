import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChecklistEditorCard } from '@/components/shared/ChecklistEditorCard';
import { useBadgeContextOptional } from '@/contexts/BadgeContext';
import { useNudges } from '@/hooks/useNudges';
import { NudgeModal } from '@/components/shared/NudgeModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Zap, HelpCircle, Target, CheckCircle } from 'lucide-react';
import { useChecklistItems } from '@/hooks/useChecklistItems';
import { useDebouncedUpdate } from '@/hooks/useDebouncedUpdate';

interface EngagePaneProps {
  data: any;
  update: (field: string, value: any) => void;
  onPhaseTransition?: (phase: string) => void;
}

export const EngagePane: React.FC<EngagePaneProps> = ({ data, update, onPhaseTransition }) => {
  const [activeSection, setActiveSection] = useState('big-idea');
  const badge = useBadgeContextOptional();
  const checkTrigger = badge?.checkTrigger ?? (() => {});
  const { isModalOpen, currentCategory, currentPhase, openNudgeModal, closeModal } = useNudges();

  const setField = (field: string, value: string) => {
    update(field, value);
    
    // Trigger badges baseado no campo
    if (field === 'bigIdea' && value.trim().length > 0) {
      checkTrigger('big_idea_created');
    } else if (field === 'essentialQuestion' && value.trim().length > 0) {
      checkTrigger('essential_question_created');
    } else if (field === 'challenge' && value.trim().length > 0) {
      checkTrigger('challenge_defined');
    }
  };

  // Estados locais com debounce para campos de texto
  const [localBigIdea, setLocalBigIdea] = useDebouncedUpdate({
    initialValue: data.bigIdea || '',
    onUpdate: setField,
    field: 'bigIdea'
  });

  const [localEssentialQuestion, setLocalEssentialQuestion] = useDebouncedUpdate({
    initialValue: data.essentialQuestion || '',
    onUpdate: setField,
    field: 'essentialQuestion'
  });

  const [localChallenge, setLocalChallenge] = useDebouncedUpdate({
    initialValue: data.challenge || '',
    onUpdate: setField,
    field: 'challenge'
  });

  const { 
    items: engageChecklist, 
    addItem: addEngageItem, 
    toggleItem: toggleEngageItem, 
    removeItem: removeEngageItem 
  } = useChecklistItems(data.id, 'engage');

  function markComplete() {
    if (!canComplete) {
      alert('Engage requer Big Idea e Essential Question preenchidas.');
      return;
    }
    
    update('engageCompleted', true);
    update('phase', 'investigate');
    // Marcar todos os itens da checklist da fase como concluídos no banco
    engageChecklist.forEach(item => {
      if (!item.done) {
        toggleEngageItem(item.id);
      }
    });
    
    // Trigger badge de conclusão da fase Engage
    checkTrigger('engage_completed');
    
    // Trigger badge do início da investigação
    checkTrigger('investigate_started');
    
    // Transição automática para a próxima fase
    if (onPhaseTransition) {
      onPhaseTransition('investigate');
    }
  }

  // Verificar conclusão das seções (usar dados atuais, não locais)
  const hasBigIdea = (data.bigIdea || '').trim().length > 0;
  const hasEssentialQuestion = (data.essentialQuestion || '').trim().length > 0;
  const hasChallenge = (data.challenge || '').trim().length > 0;
  const canComplete = hasBigIdea && hasEssentialQuestion;
  const sectionsCompleted = [hasBigIdea, hasEssentialQuestion, hasChallenge].filter(Boolean).length;

  const sections = [
    {
      id: 'big-idea',
      title: 'Big Idea',
      icon: Zap,
      description: 'Defina o problema central do projeto',
      completed: hasBigIdea
    },
    {
      id: 'essential-question',
      title: 'Essential Question',
      icon: HelpCircle,
      description: 'Formule perguntas orientadoras claras',
      completed: hasEssentialQuestion
    },
    {
      id: 'challenge',
      title: 'Challenge',
      icon: Target,
      description: 'Liste desafios específicos a resolver',
      completed: hasChallenge
    }
  ];

  return (
    <div className="space-y-8">
      {/* Navegação das Seções */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map(section => {
          const IconComponent = section.icon;
          return (
            <Card 
              key={section.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
                activeSection === section.id
                  ? 'ring-2 ring-primary border-primary/50 shadow-lg'
                  : 'hover:border-primary/30'
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${
                    activeSection === section.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-primary/10 text-primary'
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
        {activeSection === 'big-idea' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Big Idea
                  </CardTitle>
                  <CardDescription>
                    Escreva 1-2 frases que resumam o problema central
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openNudgeModal('Engage', 'Big Idea')}
                  className="flex items-center gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  Obter Nudges
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Qual é a grande ideia do seu projeto?
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Descreva o problema ou oportunidade que seu projeto pretende abordar
                  </p>
                </div>
                
                <Textarea
                  value={localBigIdea}
                  onChange={(e) => setLocalBigIdea(e.target.value)}
                  placeholder="Ex: A falta de engajamento dos jovens em práticas sustentáveis está impactando negativamente o meio ambiente urbano. Como podemos criar soluções que motivem a participação ativa da juventude em iniciativas ecológicas?"
                  rows={4}
                  className="resize-none"
                />
                
                {localBigIdea.trim().length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Big Idea definida ({localBigIdea.trim().length} caracteres)
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === 'essential-question' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    Essential Question
                  </CardTitle>
                  <CardDescription>
                    Transforme a Big Idea em uma pergunta orientadora clara
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openNudgeModal('Engage', 'Essential Question')}
                  className="flex items-center gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  Obter Nudges
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Qual é a pergunta essencial que guiará seu projeto?
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Uma boa Essential Question é aberta, provocativa e conecta-se diretamente com sua Big Idea
                  </p>
                </div>
                
                <Input
                  type="text"
                  value={localEssentialQuestion}
                  onChange={(e) => setLocalEssentialQuestion(e.target.value)}
                  placeholder="Ex: Como podemos usar a tecnologia para engajar jovens de 16-25 anos em práticas sustentáveis de forma divertida e colaborativa?"
                />
                
                {localEssentialQuestion.trim().length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Essential Question formulada ({localEssentialQuestion.trim().length} caracteres)
                    </Badge>
                  </div>
                )}
                
                {/* Dicas para Essential Question */}
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-semibold mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Dicas para uma boa Essential Question:
                      </p>
                      <ul className="space-y-1 text-xs">
                        <li>• Começa com "Como...", "Por que..." ou "O que aconteceria se..."</li>
                        <li>• É aberta (não tem uma resposta única)</li>
                        <li>• Conecta-se diretamente com sua Big Idea</li>
                        <li>• Inspira curiosidade e investigação</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === 'challenge' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Challenge
                  </CardTitle>
                  <CardDescription>
                    Liste desafios específicos que seu projeto deverá solucionar
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openNudgeModal('Engage', 'Challenge')}
                  className="flex items-center gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  Obter Nudges
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Quais são os principais desafios a serem enfrentados?
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Identifique obstáculos específicos, limitações e barreiras que precisam ser superados
                  </p>
                </div>
                
                <Textarea
                  value={localChallenge}
                  onChange={(e) => setLocalChallenge(e.target.value)}
                  placeholder={`Liste os principais desafios:\n\n• Falta de conscientização sobre impacto ambiental\n• Desconexão entre teoria e prática sustentável\n• Ausência de ferramentas acessíveis para jovens\n• Falta de incentivos tangíveis para mudança de comportamento\n• Dificuldade em medir o impacto das ações individuais`}
                  rows={6}
                  className="resize-none"
                />
                
                {localChallenge.trim().length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Desafios identificados ({localChallenge.trim().length} caracteres)
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checklist Personalizada */}
        <ChecklistEditorCard
          items={engageChecklist.map(item => ({ id: item.id, text: item.text, done: item.done }))}
          onAdd={addEngageItem}
          onToggle={toggleEngageItem}
          onRemove={removeEngageItem}
          title="Checklist da Fase Engage"
          description="Adicione tarefas específicas para esta fase"
        />

        {/* Botão de Conclusão */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold">Concluir Fase Engage</h3>
                <p className="text-sm text-muted-foreground">
                  Complete as seções obrigatórias para avançar para a próxima fase
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Badge variant={data.engageCompleted ? "default" : "secondary"} className="flex items-center gap-1">
                  {data.engageCompleted ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Concluído
                    </>
                  ) : (
                    `${sectionsCompleted}/3 seções`
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
                      Marcar Engage como concluído
                    </>
                  ) : (
                    'Complete Big Idea e Essential Question'
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