import { ReactNode } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // SVG string for inline render
  condition: (stats: AppStats) => boolean;
}

export interface AppStats {
  tasksAdded: number;
  tasksCompleted: number;
  tasksDeleted: number;
  aiMessagesSent: number;
  aiMemoriesSaved: number;
  dailyPlansGenerated: number;
  craftCalculations: number;
  daysAdvanced: number;
  tabVisits: Record<string, number>;
  soundToggled: number;
}

export const defaultStats: AppStats = {
  tasksAdded: 0,
  tasksCompleted: 0,
  tasksDeleted: 0,
  aiMessagesSent: 0,
  aiMemoriesSaved: 0,
  dailyPlansGenerated: 0,
  craftCalculations: 0,
  daysAdvanced: 0,
  tabVisits: {},
  soundToggled: 0,
};

const svgIcons = {
  skull: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  swords: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="11" y2="15"/><line x1="5" x2="5" y1="19" y2="19"/><line x1="3" x2="5" y1="21" y2="19"/></svg>',
  flask: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><line x1="5.52" x2="18.48" y1="16" y2="16"/></svg>',
  book: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
  hammer: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H11.5l2.42 2.42c.86.86 1.15 2.06.91 3.2L13 10.5"/></svg>',
  calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
  map: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>',
  check: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  brain: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/></svg>',
  trash: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
  users: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  flame: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  cookie: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>',
  speaker: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>'
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_ai_memory', title: 'Registro do Além', description: 'A IA selou sua primeira memória no cosmos.', icon: svgIcons.brain, condition: (s) => s.aiMemoriesSaved >= 1 },
  { id: 'task_1_created', title: 'Primeiro Pedido', description: 'Registrou sua primeira tarefa. O cemitério aguarda.', icon: svgIcons.check, condition: (s) => s.tasksAdded >= 1 },
  { id: 'task_10_completed', title: 'Trabalho Duro', description: 'Concluiu 10 tarefas. Gerry estaria orgulhoso (se lembrasse).', icon: svgIcons.check, condition: (s) => s.tasksCompleted >= 10 },
  { id: 'task_50_completed', title: 'Guardião Dedicado', description: 'Concluiu 50 tarefas! Um verdadeiro Keeper profissional.', icon: svgIcons.star, condition: (s) => s.tasksCompleted >= 50 },
  { id: 'task_deleted_5', title: 'Coveiro Sombrio', description: 'Mandou 5 tarefas para o esquecimento (deletou).', icon: svgIcons.trash, condition: (s) => s.tasksDeleted >= 5 },
  
  { id: 'alchemy_visited_5', title: 'Aprendiz Cósmico', description: 'Visitou a aba de Alquimia 5 vezes.', icon: svgIcons.flask, condition: (s) => (s.tabVisits['alchemy'] || 0) >= 5 },
  { id: 'craft_calc_3', title: 'Matemática Viva', description: 'Utilizou a Calculadora de Craft 3 vezes.', icon: svgIcons.hammer, condition: (s) => s.craftCalculations >= 3 },
  { id: 'daily_plan_1', title: 'Oráculo Diário', description: 'Gerou seu primeiro Plano do Dia com a IA.', icon: svgIcons.map, condition: (s) => s.dailyPlansGenerated >= 1 },
  { id: 'daily_plan_5', title: 'Visão do Futuro', description: 'Gerou 5 Planos do Dia. O amanhã não é mais um mistério.', icon: svgIcons.map, condition: (s) => s.dailyPlansGenerated >= 5 },
  { id: 'calendar_7_days', title: 'A Roda Gira', description: 'Avançou o calendário em pelo menos 7 dias.', icon: svgIcons.calendar, condition: (s) => s.daysAdvanced >= 7 },
  
  { id: 'chat_5_messages', title: 'Murmúrios', description: 'Enviou 5 mensagens para o crânio (IA).', icon: svgIcons.skull, condition: (s) => s.aiMessagesSent >= 5 },
  { id: 'chat_50_messages', title: 'Pacto de Sangue', description: 'Conversou exaustivamente com o Crânio Murmurante.', icon: svgIcons.flame, condition: (s) => s.aiMessagesSent >= 50 },
  { id: 'read_guide', title: 'Conhecimento Escrito', description: 'Abriu o manual de sobrevivência do Graveyard Keeper.', icon: svgIcons.book, condition: (s) => (s.tabVisits['guide'] || 0) >= 1 },
  { id: 'read_advanced', title: 'Saber Oculto', description: 'Consultou o Guia Avançado e sobreviveu.', icon: svgIcons.swords, condition: (s) => (s.tabVisits['advanced'] || 0) >= 1 },
  { id: 'techtree_view', title: 'Raízes do Progresso', description: 'Analisou a Tech Tree. Muito a fazer...', icon: svgIcons.hammer, condition: (s) => (s.tabVisits['techtree'] || 0) >= 1 },
  
  { id: 'npc_view', title: 'Habitantes da Vila', description: 'Consultou os personagens que habitam este mundo.', icon: svgIcons.users, condition: (s) => (s.tabVisits['characters'] || 0) >= 1 },
  { id: 'cooking_view', title: 'Apetite Macabro', description: 'Visitou a área de Cozinha.', icon: svgIcons.cookie, condition: (s) => (s.tabVisits['cooking'] || 0) >= 1 },
  { id: 'sound_toggled', title: 'Silêncio Tumular', description: 'Mexeu no som do Além-Túmulo ao menos uma vez.', icon: svgIcons.speaker, condition: (s) => s.soundToggled >= 1 },
  
  { id: 'early_bird', title: 'Madrugador', description: 'Visualizou todos os módulos principais pelo menos uma vez.', icon: svgIcons.star, condition: (s) => 
      (s.tabVisits['guide'] || 0) > 0 &&
      (s.tabVisits['advanced'] || 0) > 0 &&
      (s.tabVisits['alchemy'] || 0) > 0 &&
      (s.tabVisits['craftcalc'] || 0) > 0 &&
      (s.tabVisits['tasks'] || 0) > 0 &&
      (s.tabVisits['chat'] || 0) > 0 
  },
  { id: 'master_keeper', title: 'Mestre do OS', description: 'Desbloqueou quase de tudo. Sua jornada de zelador está completa.', icon: svgIcons.skull, condition: (s) => false } // Evaluated separately
];
