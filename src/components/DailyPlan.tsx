import { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { useToast } from '../lib/ToastContext';
import { days, characters } from '../data/gameData';
import { Sunrise, Sun, Moon, Loader2, Sparkles, Map, Calendar as CalendarIcon, Skull } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { SkeletonPage } from './ui/Skeleton';
import { useAchievements } from '../lib/AchievementContext';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Task {
  id: string;
  title: string;
  category?: string;
}

interface PlanXML {
  summary: string;
  morning: string[];
  afternoon: string[];
  night: string[];
}

export default function DailyPlan() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { trackEvent } = useAchievements();
  
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<PlanXML | null>(null);

  // Fetch current day and tasks
  useEffect(() => {
    if (!user) return;

    // Listen to current Day
    const settingsRef = doc(db, 'userSettings', user.uid);
    const unsubsSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data()?.currentGameDay) {
        setCurrentDay(docSnap.data().currentGameDay);
      }
    });

    // Listen to pending tasks
    const qTasks = query(collection(db, 'tasks'), where('userId', '==', user.uid), where('completed', '==', false));
    const unsubsTasks = onSnapshot(qTasks, (snapshot) => {
      const ts: Task[] = [];
      snapshot.forEach(doc => {
        ts.push({ id: doc.id, title: doc.data().title, category: doc.data().category });
      });
      setTasks(ts);
    });

    return () => {
      unsubsSettings();
      unsubsTasks();
    };
  }, [user]);

  const generatePlan = async () => {
    if (!user) {
      addToast('Conecte-se com o Além-Túmulo para planejar.', 'error');
      return;
    }

    setIsLoading(true);
    setPlan(null);

    const weekDayIndex = (currentDay - 1) % 6;
    const currentNPC = days[weekDayIndex];

    const tasksList = tasks.map(t => `- ${t.title} (Categoria: ${t.category || 'Geral'})`).join('\n');
    let prompt = `Dia atual do Jogo: Dia ${currentDay} (${currentNPC.name} - O NPC ${currentNPC.npc} está na vila hoje).\n\n`;
    prompt += `Tarefas pendentes do Jogador:\n${tasksList || 'Nenhuma tarefa pendente registrada.'}\n\n`;
    prompt += `Retorne o plano de ação otimizado em XML.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: `Você é o assistente neural do Keeper OS (Graveyard Keeper).
O seu trabalho é criar um "Plano do Dia" otimizado (em formato de cronograma) baseado no dia atual, nos NPCs disponíveis hoje, e nas tarefas pendentes do jogador.
Sua resposta DEVE estar estritamente no formato XML abaixo, sem nenhum texto Markdown extra envolvendo o XML (nada de \`\`\`xml e \`\`\`). Siga esta estrutura rigorosamente:

<plan>
  <summary>Breve resumo de 1 a 2 frases focando nas prioridades do dia.</summary>
  <morning>
    <task>Tarefa da manhã</task>
    <task>Outra tarefa</task>
  </morning>
  <afternoon>
    <task>Tarefa da tarde</task>
    <task>Outra tarefa</task>
  </afternoon>
  <night>
    <task>Tarefa da noite (Masmorra, Snake, Estudos)</task>
  </night>
</plan>

Regras de Graveyard Keeper para o plano:
- Considere que a Sra. Charm aparece da Tarde em diante no Dia da Luxúria (Vermelho).
- O Bispo aparece o dia todo no Dia do Orgulho (Roxo), ideal para Sermões de manhã.
- O Mercador aparece do meio-dia até à noite no Dia da Gula (Laranja).
- Snake aparece APENAS de noite no Dia da Inveja (Verde).
- O Astrólogo aparece no Dia da Preguiça (Azul).
- O Inquisidor aparece no Dia da Ira (Vermelho escuro).
- Se não houver tarefas pendentes, sugira atividades gerais como cortar lenha, coletar minérios ou progredir a horta e cemitério.
- O dia é curto, limite a 2 a 3 tarefas por período para ser realista.`
        }
      });

      const text = response.text || '';
      const parsedPlan = parsePlanXML(text);
      if (parsedPlan) {
        setPlan(parsedPlan);
        addToast('Plano gerado com sucesso.', 'success');
        trackEvent('dailyPlansGenerated');
      } else {
        throw new Error('Falha ao decifrar o layout XML da IA.');
      }
    } catch (e: any) {
      console.error(e);
      addToast(e.message || 'Erro ao comunicar com a Névoa Neural.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const parsePlanXML = (xmlString: string): PlanXML | null => {
    try {
      // Remover escapes markdown caso a IA ignore a instrução
      const cleanXML = xmlString.replace(/```xml/g, '').replace(/```/g, '').trim();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(cleanXML, "text/xml");

      if (xmlDoc.getElementsByTagName("parsererror").length > 0) return null;

      const summary = xmlDoc.getElementsByTagName("summary")[0]?.textContent || '';
      
      const getTasks = (tagName: string) => {
        const section = xmlDoc.getElementsByTagName(tagName)[0];
        if (!section) return [];
        const taskElements = section.getElementsByTagName("task");
        return Array.from(taskElements).map(el => el.textContent || '');
      };

      return {
        summary,
        morning: getTasks('morning'),
        afternoon: getTasks('afternoon'),
        night: getTasks('night')
      };
    } catch (e) {
      return null;
    }
  };

  const weekDayIndex = (currentDay - 1) % 6;
  const currentNPC = days[weekDayIndex];

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col h-full gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border-dark pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <Map className="text-border-gold" size={32} />
          <h2 className="text-3xl text-border-gold font-pixel drop-shadow-sm uppercase">
            Plano do Dia
          </h2>
        </div>
        <button
          onClick={generatePlan}
          disabled={isLoading || !user}
          className="bg-bg-dark border border-border-gold text-border-gold hover:bg-border-gold hover:text-bg-dark font-pixel tracking-widest uppercase px-6 py-3 rounded-sm transition-all shadow-[0_0_15px_rgba(139,107,50,0.1)] flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} className="group-hover:animate-pulse" />
          )}
          Gerar Plano (IA)
        </button>
      </div>

      <div className="bg-[rgba(18,14,12,0.6)] border border-border-dark p-4 rounded-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-bg-dark border border-border-dark p-3 rounded-md">
            <span className="font-pixel text-accent-blue text-xs uppercase tracking-wider block mb-1">Dia Atual</span>
            <span className="text-2xl text-text-parchment font-bold">{currentDay}</span>
          </div>
          <div className="flex items-center gap-3 border-l border-border-dark pl-4">
            <img src={currentNPC.image} alt={currentNPC.name} className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
            <div>
              <div className="font-pixel text-sm uppercase text-border-gold tracking-widest">{currentNPC.name}</div>
              <div className="text-xs text-text-muted mt-0.5">{currentNPC.desc}</div>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end">
          <div className="font-pixel text-xs text-text-muted uppercase tracking-wider mb-1">Tarefas Pendentes</div>
          <div className="text-xl text-accent-red font-bold">{tasks.length}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SkeletonPage />
            </motion.div>
          ) : plan ? (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-[rgba(139,107,50,0.15)] to-transparent border-l-4 border-border-gold p-4 mt-2">
                <p className="text-text-parchment italic font-serif leading-relaxed text-lg">"{plan.summary}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TimelinePhase 
                  title="Manhã" 
                  icon={Sunrise} 
                  colorClass="text-accent-blue border-accent-blue/30 bg-accent-blue/5"
                  tasks={plan.morning}
                />
                <TimelinePhase 
                  title="Tarde" 
                  icon={Sun} 
                  colorClass="text-orange-400 border-orange-400/30 bg-orange-400/5"
                  tasks={plan.afternoon}
                />
                <TimelinePhase 
                  title="Noite" 
                  icon={Moon} 
                  colorClass="text-purple-400 border-purple-400/30 bg-purple-400/5"
                  tasks={plan.night}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-border-dark py-20"
            >
              <Skull size={64} className="mb-4 opacity-20" />
              <p className="text-text-muted font-pixel text-sm uppercase tracking-widest text-center mt-2 max-w-sm">
                O crânio repousa. Clique em "Gerar Plano" para prever o seu destino neste dia.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TimelinePhase({ title, icon: Icon, colorClass, tasks }: { title: string, icon: any, colorClass: string, tasks: string[] }) {
  return (
    <div className={`flex flex-col border rounded-md ${colorClass} overflow-hidden shadow-lg`}>
      <div className="flex items-center gap-3 p-3 border-b border-inherit bg-black/20">
        <Icon size={20} className="drop-shadow-md" />
        <h3 className="font-pixel uppercase tracking-widest text-sm drop-shadow-md">{title}</h3>
      </div>
      <div className="p-4 flex-1">
        {tasks.length > 0 ? (
          <ul className="space-y-3">
            {tasks.map((task, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-[#d9c9a0]">
                <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 opacity-60 flex-shrink-0" />
                <span className="leading-snug">{task}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-white/40 italic font-serif">Nenhuma atividade essencial de alta prioridade foi prevista para este segmento.</p>
        )}
      </div>
    </div>
  );
}
