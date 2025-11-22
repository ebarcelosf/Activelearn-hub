import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from './LucideIcon';
import { useDebouncedUpdate } from '@/hooks/useDebouncedUpdate';

interface Synthesis {
  mainFindings?: string;
  patterns?: string;
  gaps?: string;
  insights?: string;
}

interface SynthesisManagerProps {
  synthesis: Synthesis;
  onUpdate: (field: string, value: string) => void;
  questions: string[];
  answers: Array<{ q: string; a: string }>;
  resources: any[];
  activities: any[];
  title: string;
  description: string;
}

export const SynthesisManager: React.FC<SynthesisManagerProps> = ({
  synthesis,
  onUpdate,
  questions,
  answers,
  resources,
  activities,
  title,
  description
}) => {
  const answeredCount = answers.filter(a => a && a.a && a.a.trim().length > 0).length;
  const completedActivities = activities.filter(act => act.status === 'completed').length;

  // Estados locais com debounce para todos os campos
  const [localMainFindings, setLocalMainFindings] = useDebouncedUpdate({
    initialValue: synthesis.mainFindings || '',
    onUpdate,
    field: 'mainFindings'
  });

  const [localPatterns, setLocalPatterns] = useDebouncedUpdate({
    initialValue: synthesis.patterns || '',
    onUpdate,
    field: 'patterns'
  });

  const [localGaps, setLocalGaps] = useDebouncedUpdate({
    initialValue: synthesis.gaps || '',
    onUpdate,
    field: 'gaps'
  });

  const [localInsights, setLocalInsights] = useDebouncedUpdate({
    initialValue: synthesis.insights || '',
    onUpdate,
    field: 'insights'
  });

  return (
    <div className="bg-muted/30 p-6 rounded-xl border border-border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      {/* Status da pesquisa */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Status da Pesquisa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{answeredCount}</div>
              <div className="text-sm text-muted-foreground">Perguntas Respondidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{completedActivities}</div>
              <div className="text-sm text-muted-foreground">Atividades Concluídas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{resources.length}</div>
              <div className="text-sm text-muted-foreground">Recursos Coletados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{questions.length}</div>
              <div className="text-sm text-muted-foreground">Total de Perguntas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campos de síntese */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <LucideIcon name="Search" className="w-3 h-3 text-primary" />
              </div>
              Principais Descobertas
              <Badge variant="outline" className="text-xs">
                Obrigatório
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={localMainFindings}
              onChange={(e) => setLocalMainFindings(e.target.value)}
              placeholder="Resuma os insights mais importantes que você descobriu durante a investigação. O que aprendeu sobre o problema? Que informações foram mais surpreendentes?"
              rows={4}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Revise suas respostas e anote as descobertas mais impactantes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <LucideIcon name="RotateCcw" className="w-3 h-3 text-primary" />
              </div>
              Padrões Identificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={localPatterns}
              onChange={(e) => setLocalPatterns(e.target.value)}
              placeholder="Que padrões ou temas recorrentes você identificou? Houve respostas similares em diferentes fontes? Que conexões podem ser feitas entre os dados coletados?"
              rows={3}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Procure por temas que aparecem em múltiplas respostas ou recursos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <LucideIcon name="CircleHelp" className="w-3 h-3 text-primary" />
              </div>
              Lacunas de Conhecimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={localGaps}
              onChange={(e) => setLocalGaps(e.target.value)}
              placeholder="Que perguntas importantes ainda não foram respondidas? Que aspectos do problema precisam de mais investigação? Onde você encontrou informações contraditórias?"
              rows={3}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Identifique limitações para orientar futuras pesquisas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <LucideIcon name="Lightbulb" className="w-3 h-3 text-primary" />
              </div>
              Insights para Soluções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={localInsights}
              onChange={(e) => setLocalInsights(e.target.value)}
              placeholder="Com base na sua pesquisa, que direções promissoras você vê para possíveis soluções? Que oportunidades foram identificadas? Como os insights podem guiar a fase Act?"
              rows={3}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Conecte suas descobertas com possíveis caminhos para a solução
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso */}
      <div className="mt-6 p-4 bg-card rounded-lg border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso da Síntese:</span>
          <span className="font-medium">
            {Object.values(synthesis).filter(value => value && value.trim().length > 0).length}/4 seções preenchidas
          </span>
        </div>
        <div className="mt-2 w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(Object.values(synthesis).filter(value => value && value.trim().length > 0).length / 4) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};