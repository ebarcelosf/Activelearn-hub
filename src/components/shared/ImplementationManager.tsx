import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from './LucideIcon';
import { useDebouncedUpdate } from '@/hooks/useDebouncedUpdate';

interface Implementation {
  overview?: string;
  timeline?: string;
  resources?: string;
  team?: string;
  risks?: string;
}

interface ImplementationManagerProps {
  implementation: Implementation;
  onUpdate: (field: string, value: string) => void;
  title: string;
  description: string;
}

export const ImplementationManager: React.FC<ImplementationManagerProps> = ({
  implementation,
  onUpdate,
  title,
  description
}) => {
  // Estados locais com debounce para todos os campos
  const [localOverview, setLocalOverview] = useDebouncedUpdate({
    initialValue: implementation.overview || '',
    onUpdate,
    field: 'overview'
  });

  const [localTimeline, setLocalTimeline] = useDebouncedUpdate({
    initialValue: implementation.timeline || '',
    onUpdate,
    field: 'timeline'
  });

  const [localResources, setLocalResources] = useDebouncedUpdate({
    initialValue: implementation.resources || '',
    onUpdate,
    field: 'resources'
  });

  const [localTeam, setLocalTeam] = useDebouncedUpdate({
    initialValue: implementation.team || '',
    onUpdate,
    field: 'team'
  });

  const [localRisks, setLocalRisks] = useDebouncedUpdate({
    initialValue: implementation.risks || '',
    onUpdate,
    field: 'risks'
  });

  return (
    <div className="bg-muted/30 p-6 rounded-xl border border-border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <LucideIcon name="ClipboardList" className="w-3 h-3 text-primary" />
              </div>
              Visão Geral da Implementação
              <Badge variant="outline" className="text-xs">
                Obrigatório
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={localOverview}
              onChange={(e) => setLocalOverview(e.target.value)}
              placeholder="Descreva a estratégia geral de implementação. Como sua solução será construída e lançada? Qual é a abordagem de desenvolvimento?"
              rows={4}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Pense em fases de desenvolvimento, desde o MVP até a versão completa
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <LucideIcon name="Clock" className="w-3 h-3 text-primary" />
              </div>
              Cronograma e Marcos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={localTimeline}
              onChange={(e) => setLocalTimeline(e.target.value)}
              placeholder={`Defina as principais etapas e prazos:\n\nFase 1 (Semanas 1-2): Prototipagem\nFase 2 (Semanas 3-4): Desenvolvimento MVP\nFase 3 (Semanas 5-6): Testes e iteração\nFase 4 (Semanas 7-8): Lançamento piloto`}
              rows={5}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Seja realista com os prazos e inclua tempo para testes e ajustes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <LucideIcon name="DollarSign" className="w-3 h-3 text-primary" />
              </div>
              Recursos Necessários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={localResources}
              onChange={(e) => setLocalResources(e.target.value)}
              placeholder="Liste os recursos necessários: orçamento, ferramentas, infraestrutura, software, equipamentos, etc. Inclua estimativas de custos quando possível."
              rows={4}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Considere tanto recursos financeiros quanto técnicos e humanos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <LucideIcon name="Users" className="w-3 h-3 text-primary" />
              </div>
              Equipe e Responsabilidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={localTeam}
              onChange={(e) => setLocalTeam(e.target.value)}
              placeholder="Que habilidades e papéis são necessários? Quem será responsável por cada área? Como a equipe será organizada?"
              rows={3}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Identifique competências necessárias e como obtê-las
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <LucideIcon name="Shield" className="w-3 h-3 text-primary" />
              </div>
              Riscos e Contingências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={localRisks}
              onChange={(e) => setLocalRisks(e.target.value)}
              placeholder="Que riscos podem impactar a implementação? Como mitigar esses riscos? Quais são os planos de contingência?"
              rows={3}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Antecipe problemas técnicos, financeiros e de prazo
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso */}
      <div className="mt-6 p-4 bg-card rounded-lg border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso do Planejamento:</span>
          <span className="font-medium">
            {Object.values(implementation).filter(value => value && value.trim().length > 0).length}/5 seções preenchidas
          </span>
        </div>
        <div className="mt-2 w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(Object.values(implementation).filter(value => value && value.trim().length > 0).length / 5) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};