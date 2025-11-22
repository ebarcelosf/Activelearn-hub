// utils/badgeConstants.ts
// Sistema de badges e conquistas para o CBL

export const BADGE_CATEGORIES = {
  FASES_CBL: 'Fases CBL',
  ENGAJAMENTO: 'Engajamento', 
  INVESTIGACAO: 'Investigação',
  CRIATIVIDADE: 'Criatividade',
  MAESTRIA: 'Maestria',
  ESPECIAL: 'Especial'
} as const;

export type BadgeCategory = typeof BADGE_CATEGORIES[keyof typeof BADGE_CATEGORIES];
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface BadgeDefinition {
  id: string;
  title: string;
  desc: string;
  xp: number;
  icon: string; // Lucide icon name instead of emoji
  category: BadgeCategory;
  trigger: string;
  rarity: BadgeRarity;
}

export const ALL_BADGES: Record<string, BadgeDefinition> = {
  // BADGES DAS FASES PRINCIPAIS CBL
  visionario: { 
    id: 'visionario', 
    title: 'Visionário', 
    desc: 'Completou a fase Engage do CBL', 
    xp: 100, 
    icon: 'Star', 
    category: BADGE_CATEGORIES.FASES_CBL,
    trigger: 'engage_completed',
    rarity: 'common'
  },
  investigador_iniciante: { 
    id: 'investigador_iniciante', 
    title: 'Investigador', 
    desc: 'Iniciou a fase Investigate', 
    xp: 40, 
    icon: 'Search', 
    category: BADGE_CATEGORIES.FASES_CBL,
    trigger: 'investigate_started',
    rarity: 'common'
  },
  implementador: { 
    id: 'implementador', 
    title: 'Implementador', 
    desc: 'Completou a fase Act do CBL', 
    xp: 140, 
    icon: 'Zap', 
    category: BADGE_CATEGORIES.FASES_CBL,
    trigger: 'act_completed',
    rarity: 'common'
  },

  // BADGES DE PROGRESSO ENGAGE
  primeiro_passo: { 
    id: 'primeiro_passo', 
    title: 'Primeiro Passo', 
    desc: 'Escreveu sua Big Idea', 
    xp: 40, 
    icon: 'Target', 
    category: BADGE_CATEGORIES.ENGAJAMENTO,
    trigger: 'big_idea_created',
    rarity: 'common'
  },
  questionador: { 
    id: 'questionador', 
    title: 'Questionador', 
    desc: 'Criou sua Essential Question', 
    xp: 35, 
    icon: 'HelpCircle', 
    category: BADGE_CATEGORIES.ENGAJAMENTO,
    trigger: 'essential_question_created',
    rarity: 'common'
  },
  desafiador: { 
    id: 'desafiador', 
    title: 'Desafiador', 
    desc: 'Definiu seu Challenge', 
    xp: 40, 
    icon: 'Flag', 
    category: BADGE_CATEGORIES.ENGAJAMENTO,
    trigger: 'challenge_defined',
    rarity: 'common'
  },

  // BADGES DE INVESTIGATE
  pesquisador: { 
    id: 'pesquisador', 
    title: 'Pesquisador', 
    desc: 'Respondeu 3 perguntas-guia', 
    xp: 60, 
    icon: 'BookOpen', 
    category: BADGE_CATEGORIES.INVESTIGACAO,
    trigger: 'questions_answered_3',
    rarity: 'common'
  },
  analista: { 
    id: 'analista', 
    title: 'Analista', 
    desc: 'Respondeu 5 perguntas-guia', 
    xp: 70, 
    icon: 'Brain', 
    category: BADGE_CATEGORIES.INVESTIGACAO,
    trigger: 'questions_answered_5',
    rarity: 'uncommon'
  },
  coletor: { 
    id: 'coletor', 
    title: 'Coletor', 
    desc: 'Adicionou recursos de pesquisa', 
    xp: 30, 
    icon: 'Bookmark', 
    category: BADGE_CATEGORIES.INVESTIGACAO,
    trigger: 'resources_added',
    rarity: 'common'
  },

  // BADGES DE ACT
  planejador: { 
    id: 'planejador', 
    title: 'Planejador', 
    desc: 'Criou sua primeira atividade', 
    xp: 45, 
    icon: 'ClipboardList', 
    category: BADGE_CATEGORIES.ENGAJAMENTO,
    trigger: 'activity_created',
    rarity: 'common'
  },
  criador: { 
    id: 'criador', 
    title: 'Criador', 
    desc: 'Criou seu primeiro protótipo', 
    xp: 80, 
    icon: 'Wrench', 
    category: BADGE_CATEGORIES.CRIATIVIDADE,
    trigger: 'prototype_created',
    rarity: 'uncommon'
  },
  inovador: { 
    id: 'inovador', 
    title: 'Inovador', 
    desc: 'Criou 3+ protótipos', 
    xp: 90, 
    icon: 'Rocket', 
    category: BADGE_CATEGORIES.CRIATIVIDADE,
    trigger: 'multiple_prototypes_created',
    rarity: 'uncommon'
  },
  
  // BADGE ESPECIAL
  inspirado: { 
    id: 'inspirado', 
    title: 'Inspirado', 
    desc: 'Obteve um nudge para inspiração', 
    xp: 30, 
    icon: 'Lightbulb', 
    category: BADGE_CATEGORIES.ESPECIAL,
    trigger: 'nudge_obtained',
    rarity: 'common'
  },
  
  // BADGE DE MAESTRIA FINAL
  mestre_cbl: { 
    id: 'mestre_cbl', 
    title: 'Mestre CBL', 
    desc: 'Completou todo o ciclo CBL', 
    xp: 200, 
    icon: 'Trophy', 
    category: BADGE_CATEGORIES.MAESTRIA,
    trigger: 'cbl_cycle_completed',
    rarity: 'legendary'
  }
};

// Lista simplificada de badges por ID para fácil acesso
export const BADGE_LIST = Object.values(ALL_BADGES);

// Função helper para obter badge por ID
export const getBadgeById = (id: string): BadgeDefinition | null => ALL_BADGES[id] || null;

// Função helper para obter badges por categoria
export const getBadgesByCategory = (category: BadgeCategory): BadgeDefinition[] => 
  BADGE_LIST.filter(badge => badge.category === category);

// Função helper para obter badges por raridade
export const getBadgesByRarity = (rarity: BadgeRarity): BadgeDefinition[] => 
  BADGE_LIST.filter(badge => badge.rarity === rarity);

// XP total possível
export const TOTAL_XP = BADGE_LIST.reduce((sum, badge) => sum + badge.xp, 0);

// Configuração de níveis
export const LEVEL_CONFIG = {
  1: { minXP: 0, maxXP: 99, title: 'Iniciante' },
  2: { minXP: 100, maxXP: 249, title: 'Aprendiz' },
  3: { minXP: 250, maxXP: 499, title: 'Praticante' },
  4: { minXP: 500, maxXP: 999, title: 'Especialista' },
  5: { minXP: 1000, maxXP: Infinity, title: 'Mestre CBL' }
} as const;

// Função para calcular nível baseado no XP
export const calculateLevel = (totalXP: number) => {
  for (const [level, config] of Object.entries(LEVEL_CONFIG)) {
    if (totalXP >= config.minXP && totalXP <= config.maxXP) {
      return {
        level: parseInt(level),
        title: config.title,
        currentXP: totalXP,
        minXP: config.minXP,
        maxXP: config.maxXP === Infinity ? config.minXP + 500 : config.maxXP,
        progress: config.maxXP === Infinity ? 100 : 
                 Math.round(((totalXP - config.minXP) / (config.maxXP - config.minXP)) * 100)
      };
    }
  }
  return { level: 1, title: 'Iniciante', currentXP: totalXP, minXP: 0, maxXP: 99, progress: 0 };
};