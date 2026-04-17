/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Guide from './components/Guide';
import AdvancedGuide from './components/AdvancedGuide';
import Calendar from './components/Calendar';
import Characters from './components/Characters';
import Alchemy from './components/Alchemy';
import AIChat from './components/AIChat';
import Tasks from './components/Tasks';
import Cooking from './components/Cooking';
import TechTree from './components/TechTree';
import { Volume2, VolumeX } from 'lucide-react';

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
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen w-full p-2 md:p-5 relative bg-bg-dark text-text-parchment font-sans space-y-4 md:space-y-0 md:space-x-4">
      {/* Audio Toggle */}
      <button 
        onClick={toggleMute}
        className="absolute top-2 right-2 md:top-4 md:right-4 z-50 bg-panel-bg border border-border-gold p-2 rounded-sm text-border-gold hover:bg-[rgba(139,107,50,0.3)] transition-colors"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* Main Container */}
      <div className="w-full max-w-7xl h-[95vh] md:h-[85vh] flex flex-col md:flex-row gap-4">
        {/* Left Sidebar */}
        <div className="bento-card flex flex-col w-full md:w-64 flex-shrink-0 md:h-full overflow-y-auto">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} playSound={playClickSound} />
        </div>
        
        {/* Main Content Area */}
        <div className="bento-card flex flex-col flex-1 overflow-hidden bg-gradient-to-br from-panel-bg to-bg-dark relative h-full">
          <div className="flex justify-between items-center mb-0 p-4 border-b border-border-dark z-10 bg-panel-bg shadow-md">
            <div className="logo-area">
              <h1 className="text-3xl md:text-4xl uppercase text-border-gold drop-shadow-md font-pixel m-0 leading-none">Keeper OS</h1>
              <span className="text-xs md:text-sm text-accent-green font-pixel uppercase tracking-widest mt-1 block">Conectado ao Além-Túmulo</span>
            </div>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 relative z-10 scroll-smooth custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="min-h-full w-full"
              >
                {activeTab === 'guide' && <Guide />}
                {activeTab === 'advanced' && <AdvancedGuide />}
                {activeTab === 'techtree' && <TechTree />}
                {activeTab === 'calendar' && <Calendar />}
                {activeTab === 'characters' && <Characters />}
                {activeTab === 'alchemy' && <Alchemy />}
                {activeTab === 'cooking' && <Cooking />}
                {activeTab === 'tasks' && <Tasks />}
                {activeTab === 'chat' && <AIChat />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}






