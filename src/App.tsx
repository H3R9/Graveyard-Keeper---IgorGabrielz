/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import GlobalSearch from './components/GlobalSearch';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Volume2, VolumeX } from 'lucide-react';
import { NavigationProvider } from './lib/NavigationContext';
import { SkeletonPage } from './components/ui/Skeleton';

// Map for prefetching
export const routeImports = {
  guide: () => import('./components/Guide'),
  advanced: () => import('./components/AdvancedGuide'),
  techtree: () => import('./components/TechTree'),
  calendar: () => import('./components/Calendar'),
  characters: () => import('./components/Characters'),
  alchemy: () => import('./components/Alchemy'),
  cooking: () => import('./components/Cooking'),
  tasks: () => import('./components/Tasks'),
  chat: () => import('./components/AIChat'),
};

// Lazy loaded components
const Guide = lazy(routeImports.guide);
const AdvancedGuide = lazy(routeImports.advanced);
const Calendar = lazy(routeImports.calendar);
const Characters = lazy(routeImports.characters);
const Alchemy = lazy(routeImports.alchemy);
const AIChat = lazy(routeImports.chat);
const Tasks = lazy(routeImports.tasks);
const Cooking = lazy(routeImports.cooking);
const TechTree = lazy(routeImports.techtree);

export default function App() {
  const [activeTab, setActiveTab] = useState('guide');
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset scroll position when tab changes
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  useEffect(() => {
    // Create audio element for background sound
    const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_5b66160533.mp3?filename=dark-ambient-114302.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  const playClickSound = () => {
    if (!isMuted) {
      const click = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b8f8e028.mp3?filename=click-button-140881.mp3');
      click.volume = 0.5;
      click.play().catch(e => console.log("Click sound failed:", e));
    }
  };

  return (
    <NavigationProvider activeTab={activeTab} setActiveTab={setActiveTab} playSound={playClickSound}>
      <div className="flex flex-col md:flex-row items-center justify-center min-h-screen w-full p-2 md:p-5 relative bg-bg-dark text-text-parchment font-sans space-y-0 md:space-x-4">
        {/* Audio Toggle */}
        <button 
          onClick={toggleMute}
          className="absolute top-2 right-2 md:top-4 md:right-4 z-50 bg-panel-bg border border-border-gold p-2 rounded-sm text-border-gold hover:bg-[rgba(139,107,50,0.3)] transition-colors"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        {/* Main Container */}
        <div className="w-full max-w-7xl h-[100dvh] md:h-[85vh] flex gap-4 pb-20 md:pb-0 pt-10 md:pt-0">
          <Sidebar />
          
          {/* Main Content Area */}
          <div className="bento-card flex flex-col flex-1 overflow-hidden bg-gradient-to-br from-panel-bg to-bg-dark relative h-full">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center p-4 border-b border-border-dark z-20 bg-panel-bg shadow-md gap-4">
              <div className="logo-area shrink-0">
                <h1 className="text-3xl md:text-4xl uppercase text-border-gold drop-shadow-md font-pixel m-0 leading-none title-flicker">Keeper OS</h1>
                <span className="text-xs md:text-sm text-accent-green font-pixel uppercase tracking-widest mt-1 block">Conectado ao Além-Túmulo</span>
              </div>
              
              <div className="w-full xl:w-96 shrink-0 relative z-50">
                <GlobalSearch />
              </div>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 relative z-10 scroll-smooth custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="min-h-full w-full"
                >
                  <Suspense fallback={<SkeletonPage />}>
                    {activeTab === 'guide' && (
                      <ErrorBoundary fallbackTitle="Falha na Leitura do Guia" fallbackMessage="As páginas deste tomo parecem estar em chamas ou ilegíveis.">
                        <Guide />
                      </ErrorBoundary>
                    )}
                    {activeTab === 'advanced' && (
                      <ErrorBoundary fallbackTitle="Falha no Guia Avançado" fallbackMessage="Símbolos complexos distorceram a mente do sábio. Não foi possível ler as regras avançadas.">
                        <AdvancedGuide />
                      </ErrorBoundary>
                    )}
                    {activeTab === 'techtree' && (
                      <ErrorBoundary fallbackTitle="Mesa de Estudo Danificada" fallbackMessage="O diagrama da árvore de tecnologia está manchado de sangue. Impossível decifrar o conhecimento.">
                        <TechTree />
                      </ErrorBoundary>
                    )}
                    {activeTab === 'calendar' && (
                      <ErrorBoundary fallbackTitle="Distorção Temporal" fallbackMessage="Os ponteiros do tempo pararam. O calendário astrológico sofreu uma anomalia severa.">
                        <Calendar />
                      </ErrorBoundary>
                    )}
                    {activeTab === 'characters' && (
                      <ErrorBoundary fallbackTitle="Registro de NPCs Inacessível" fallbackMessage="Os aldeões se recusaram a falar ou sumiram. Erro grave ao carregar as personas da vila.">
                        <Characters />
                      </ErrorBoundary>
                    )}
                    {activeTab === 'alchemy' && (
                      <ErrorBoundary fallbackTitle="Explosão Alquímica Ocorrida" fallbackMessage="Um frasco volátil destruiu a bancada. As receitas de alquimia estão corrompidas.">
                        <Alchemy />
                      </ErrorBoundary>
                    )}
                    {activeTab === 'cooking' && (
                      <ErrorBoundary fallbackTitle="Fogo Descontrolado no Forno" fallbackMessage="Um ingrediente errado causou indigestão no sistema. O livro de receitas carbonizou.">
                        <Cooking />
                      </ErrorBoundary>
                    )}
                    {activeTab === 'tasks' && (
                      <ErrorBoundary fallbackTitle="Anotações Perdidas no Limbo" fallbackMessage="Seu rascunho de tarefas sumiu na neblina do cemitério. Conexão corrompida com o registro inferior.">
                        <Tasks />
                      </ErrorBoundary>
                    )}
                    {activeTab === 'chat' && (
                      <ErrorBoundary fallbackTitle="Conexão Neural Rompida" fallbackMessage="O crânio murmurante perdeu subitamente a conexão com o Além-Túmulo local.">
                        <AIChat />
                      </ErrorBoundary>
                    )}
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </NavigationProvider>
  );
}






