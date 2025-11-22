// components/shared/NudgeModal.tsx
import React, { useState, useEffect } from 'react';
import { NudgeItem, getNudgesByCategory } from '@/utils/nudgeConstants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';

interface NudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  phase: string;
}

export const NudgeModal: React.FC<NudgeModalProps> = ({ 
  isOpen, 
  onClose, 
  category, 
  phase
}) => {
  const [selectedNudgeIndex, setSelectedNudgeIndex] = useState(0);
  const [nudges, setNudges] = useState<NudgeItem[]>([]);

  useEffect(() => {
    if (isOpen && phase && category) {
      const allNudges = getNudgesByCategory(phase as 'Engage' | 'Investigate' | 'Act', category);
      setNudges(allNudges);
      setSelectedNudgeIndex(0);
    }
  }, [isOpen, phase, category]);

  const selectedNudge = nudges[selectedNudgeIndex];

  const handleNext = () => {
    setSelectedNudgeIndex((prev) => (prev + 1) % nudges.length);
  };

  const handlePrevious = () => {
    setSelectedNudgeIndex((prev) => (prev - 1 + nudges.length) % nudges.length);
  };

  if (!selectedNudge) {
    console.warn('No selected nudge available');
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Nudges para {category}
            <Badge variant="secondary">{phase}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Nudge Principal */}
          <Card className="p-6 border-l-4 border-l-primary">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">
                {selectedNudge.title}
              </h3>
              <Badge variant="outline">
                {selectedNudgeIndex + 1} de {nudges.length}
              </Badge>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {selectedNudge.detail}
            </p>
          </Card>

          {/* Controles de Navegação */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePrevious}
                disabled={nudges.length <= 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-3 w-3" />
                Anterior
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNext}
                disabled={nudges.length <= 1}
                className="flex items-center gap-1"
              >
                Próximo
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
            
            <Button variant="default" onClick={onClose}>
              Fechar
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};