import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { NUDGE_CATEGORIES } from '@/utils/nudgeConstants';

interface PhaseSidebarProps {
  phase: string;
  setPhase: (phase: string) => void;
  project: any;
}

// Função para verificar se uma fase pode ser acessada
const canAccessPhase = (phase: string, project: any): boolean => {
  const answeredCount = (project.answers || []).filter((a: any) => a && a.a && a.a.trim().length > 0).length;
  const completedActivities = (project.activities || []).filter((a: any) => a.status === 'completed').length;
  const hasSynthesis = !!(project.synthesis?.mainFindings || project.researchSynthesis);
  switch (phase) {
    case 'engage':
      return true; // Sempre pode acessar a primeira fase
    case 'investigate':
      return !!(project.engageCompleted || (project.bigIdea && project.essentialQuestion));
    case 'act':
      return !!(project.investigateCompleted || (answeredCount >= 3 && completedActivities >= 1 && hasSynthesis));
    default:
      return false;
  }
};

export const PhaseSidebar: React.FC<PhaseSidebarProps> = ({ phase, setPhase, project }) => {
  const phases = [
    { id: 'engage', name: 'Engage', icon: 'target', description: 'Identifique o problema' },
    { id: 'investigate', name: 'Investigate', icon: 'search', description: 'Pesquise e analise' },
    { id: 'act', name: 'Act', icon: 'zap', description: 'Desenvolva soluções' }
  ];

  return (
    <div className="w-80 bg-card rounded-xl border shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Fases CBL</h3>
        <div className="text-sm text-muted-foreground">
          Complete cada fase sequencialmente
        </div>
      </div>

      <div className="space-y-3">
        {phases.map((p) => {
          const isAccessible = canAccessPhase(p.id, project);
          const isCompleted = (() => {
            switch (p.id) {
              case 'engage':
                return !!(project.bigIdea && project.essentialQuestion);
              case 'investigate': {
                const answeredCount = (project.answers || []).filter((a: any) => a && a.a && a.a.trim().length > 0).length;
                const completedActivities = (project.activities || []).filter((a: any) => a.status === 'completed').length;
                const hasSynthesis = !!(project.synthesis?.mainFindings || project.researchSynthesis);
                return !!(project.investigateCompleted || (answeredCount >= 3 && completedActivities >= 1 && hasSynthesis));
              }
              case 'act': {
                const hasSolution = !!(project.solution?.description || project.solutionDevelopment);
                const hasImplementation = !!(project.implementation?.overview || (project.implementationPlan && project.implementationPlan.length > 0));
                const hasEvaluation = !!(project.evaluation?.objectives || (project.evaluationCriteria && project.evaluationCriteria.length > 0));
                const hasPrototypes = (project.prototypes && project.prototypes.length > 0) || false;
                return !!(project.actCompleted || (hasSolution && hasImplementation && hasEvaluation && hasPrototypes));
              }
              default:
                return !!(project.engageCompleted || (project.bigIdea && project.essentialQuestion));
            }
          })();

          return (
            <button
              key={p.id}
              onClick={() => isAccessible ? setPhase(p.id) : null}
              disabled={!isAccessible}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                !isAccessible
                  ? 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                  : phase === p.id
                  ? 'border-primary bg-primary/10 shadow-sm hover:shadow-md'
                  : 'border-border bg-background hover:border-primary/50 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{p.icon}</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : phase === p.id && isAccessible
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border'
                }`}>
                  {isCompleted && <span className="text-xs">✓</span>}
                  {!isCompleted && phase === p.id && isAccessible && <span className="text-xs">●</span>}
                  {!isCompleted && !isAccessible && <span className="text-xs">🔒</span>}
                </div>
              </div>
              <div className="font-semibold mb-1">{p.name}</div>
              <div className="text-xs">{p.description}</div>
              {!isAccessible && (
                <div className="text-xs mt-1 text-orange-500">
                  Complete a fase anterior primeiro
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface NudgeModalProps {
  visible: boolean;
  phase: string;
  project: any;
  onClose: () => void;
  grantBadge?: (badge: any) => void;
}

export const NudgeModal: React.FC<NudgeModalProps> = ({ visible, phase, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentNudgeIndex, setCurrentNudgeIndex] = useState(0);

  const availableCategories = Object.keys(NUDGE_CATEGORIES[phase as keyof typeof NUDGE_CATEGORIES] || {});
  const currentNudges = selectedCategory ? (NUDGE_CATEGORIES[phase as keyof typeof NUDGE_CATEGORIES]?.[selectedCategory] || []) : [];

  useEffect(() => {
    if (visible) {
      setSelectedCategory(null);
      setCurrentNudgeIndex(0);
    }
  }, [visible, phase]);

  if (!visible) return null;

  const currentNudge = currentNudges[currentNudgeIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.98, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="bg-card p-6 rounded-xl w-full max-w-2xl shadow-lg border"
        >
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-lg bg-primary">
                  {phase[0]?.toUpperCase()}
                </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-foreground">Nudges — {phase}</h4>
              <p className="text-muted-foreground mt-1">Selecione uma categoria para ver sugestões específicas</p>

              {!selectedCategory ? (
                <div className="mt-6 space-y-3">
                  <p className="text-sm font-medium text-foreground mb-4">Escolha o tipo de nudge:</p>
                  {availableCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className="w-full p-4 text-left rounded-lg bg-muted border hover:border-primary hover:shadow-md transition-all duration-200"
                    >
                      <div className="font-medium text-foreground">{category}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-sm text-primary hover:underline"
                    >
                      ← Voltar para categorias
                    </button>
                    <div className="text-sm text-muted-foreground">
                      {selectedCategory} • {currentNudgeIndex + 1} de {currentNudges.length}
                    </div>
                  </div>

                  {currentNudge && (
                    <div className="p-4 rounded-lg bg-muted border">
                      <div className="font-medium text-foreground mb-2">{currentNudge.title}</div>
                      <div className="text-muted-foreground">{currentNudge.detail}</div>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setCurrentNudgeIndex(i => Math.max(0, i - 1))} 
                        disabled={currentNudgeIndex === 0} 
                        variant="outline"
                      >
                        ← Anterior
                      </Button>
                      <Button 
                        onClick={() => setCurrentNudgeIndex(i => Math.min(currentNudges.length - 1, i + 1))} 
                        disabled={currentNudgeIndex === currentNudges.length - 1}
                      >
                        Próximo →
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={onClose}>
                  ✕ Fechar
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};