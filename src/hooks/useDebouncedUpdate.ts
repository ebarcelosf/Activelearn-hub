import { useState, useEffect } from 'react';

interface UseDebouncedUpdateOptions {
  initialValue: string;
  onUpdate: (field: string, value: string) => void;
  field: string;
  delay?: number;
}

/**
 * Hook customizado para gerenciar atualizações com debouncing.
 * Atualiza a UI instantaneamente e salva no banco de dados após um delay.
 * 
 * @param initialValue - Valor inicial do campo
 * @param onUpdate - Função de callback para salvar no banco de dados
 * @param field - Nome do campo sendo atualizado
 * @param delay - Tempo de delay em ms (padrão: 500ms)
 * @returns [localValue, setLocalValue] - Estado local e setter
 */
export const useDebouncedUpdate = ({
  initialValue,
  onUpdate,
  field,
  delay = 500
}: UseDebouncedUpdateOptions): [string, (value: string) => void] => {
  const [localValue, setLocalValue] = useState(initialValue);

  // Sincronizar estado local com mudanças externas
  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  // Debounce: salvar no banco após o usuário parar de digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== initialValue) {
        onUpdate(field, localValue);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [localValue, delay, field, onUpdate, initialValue]);

  return [localValue, setLocalValue];
};
