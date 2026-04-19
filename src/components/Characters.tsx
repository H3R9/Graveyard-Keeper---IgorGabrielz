import { useState } from 'react';
import { characters } from '../data/gameData';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import Markdown from 'react-markdown';

export default function Characters() {
  const [selectedChar, setSelectedChar] = useState<typeof characters[0] | null>(null);

  return (
    <div className="max-w-6xl mx-auto p-4 relative">
      <h2 className="text-4xl text-border-gold mb-6 border-b-4 border-border-dark pb-2 text-shadow-md">
        Habitantes da Vila
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {characters.map((char) => (
          <div 
            key={char.name} 
            id={`char-${char.name.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={() => setSelectedChar(char)}
            className="flex items-center gap-3 p-3 bg-[rgba(0,0,0,0.5)] border-4 border-border-dark hover:border-border-gold transition-colors cursor-pointer scroll-mt-24"
          >
            <div className="w-16 h-16 bg-[#2c2522] border-2 border-border-dark flex-shrink-0 relative flex items-center justify-center">
              <img 
                src={char.image} 
                alt={char.name} 
                className="w-full h-full object-cover pixelated"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/' + char.name + '/50/50';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl text-border-gold truncate">{char.name}</h3>
              <p className="text-sm text-accent-blue uppercase tracking-wider truncate mb-1">{char.role}</p>
              <p className="text-lg text-text-parchment opacity-90 line-clamp-2 leading-tight">
                {char.desc.replace(/\s*!\[.*?\]\(.*?\)/g, '')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedChar && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
            onClick={() => setSelectedChar(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-panel-bg border-4 border-border-gold p-6 max-w-lg w-full relative shadow-[0_0_30px_rgba(166,124,61,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedChar(null)}
                className="absolute top-2 right-2 text-text-muted hover:text-accent-red transition-colors"
              >
                <X size={32} />
              </button>
              
              <div className="flex flex-col items-center text-center mt-4">
                <div className="w-32 h-32 bg-[#2c2522] border-4 border-border-dark mb-4 flex items-center justify-center">
                  <img 
                    src={selectedChar.image} 
                    alt={selectedChar.name} 
                    className="w-full h-full object-cover pixelated"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/' + selectedChar.name + '/128/128';
                    }}
                  />
                </div>
                <h3 className="text-4xl text-border-gold mb-1">{selectedChar.name}</h3>
                <p className="text-xl text-accent-blue uppercase tracking-widest mb-6">{selectedChar.role}</p>
                <div className="bg-[rgba(0,0,0,0.5)] border-2 border-border-dark p-4 w-full text-left max-h-[40vh] overflow-y-auto custom-scrollbar">
                  <div className="text-2xl text-text-parchment leading-relaxed markdown-body inline-markdown">
                    <Markdown>{selectedChar.desc}</Markdown>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


