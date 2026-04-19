import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, Hash, FlaskConical, Utensils, GitMerge, User } from 'lucide-react';
import Fuse from 'fuse.js';
import { cn } from '../lib/utils';
import { characters, cookingRecipes, alchemyRecipes, techPriorities } from '../data/gameData';

interface GlobalSearchProps {
  setActiveTab: (tab: string) => void;
  playSound?: () => void;
}

type SearchResultItem = {
  type: 'character' | 'cooking' | 'alchemy' | 'tech';
  id?: string;
  name: string;
  desc: string;
  matchScore?: number;
};

export default function GlobalSearch({ setActiveTab, playSound }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Prepare searchable data
  const searchableData: SearchResultItem[] = [
    ...characters.map(c => ({ type: 'character' as const, name: c.name, desc: c.desc })),
    ...cookingRecipes.map(c => ({ type: 'cooking' as const, name: c.name, desc: c.desc })),
    ...alchemyRecipes.map(c => ({ type: 'alchemy' as const, name: c.name, desc: c.desc })),
    ...techPriorities.flatMap(p => p.techs).map(t => ({ type: 'tech' as const, id: t.id, name: t.name, desc: t.desc }))
  ];

  const fuse = new Fuse(searchableData, {
    keys: ['name', 'desc'],
    threshold: 0.4,
    includeScore: true,
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() === '') {
        setResults([]);
        setSelectedIndex(0);
        return;
      }
      
      const res = fuse.search(query).map(r => ({
        ...r.item,
        matchScore: r.score
      }));
      
      setResults(res.slice(0, 8)); // Top 8 results
      setSelectedIndex(0);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter') setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Scroll to selected item in results list
  useEffect(() => {
    if (resultsRef.current && isOpen && results.length > 0) {
      const selectedEl = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, isOpen, results]);

  const handleSelect = (item: SearchResultItem) => {
    if (playSound) playSound();
    
    // Default sub-id for anchor hashing
    let hash = '';
    
    if (item.type === 'character') {
      setActiveTab('characters');
      hash = `char-${item.name.replace(/\s+/g, '-').toLowerCase()}`;
    } else if (item.type === 'cooking') {
      setActiveTab('cooking');
      hash = `cooking-${item.name.replace(/\s+/g, '-').toLowerCase()}`;
    } else if (item.type === 'alchemy') {
      setActiveTab('alchemy');
      hash = `alchemy-${item.name.replace(/\s+/g, '-').toLowerCase()}`;
    } else if (item.type === 'tech') {
      setActiveTab('techtree');
      if (item.id) hash = `tech-${item.id}`;
    }
    
    // Clear & close
    setIsOpen(false);
    setQuery('');
    
    // Add small delay to let tab render, then try to scroll to element
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Temporarily highlight
          el.classList.add('ring-4', 'ring-accent-green', 'ring-offset-2', 'ring-offset-bg-dark', 'transition-all', 'duration-500');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-accent-green', 'ring-offset-2', 'ring-offset-bg-dark');
          }, 2000);
        }
      }, 300);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'character': return <User size={16} className="text-accent-blue" />;
      case 'cooking': return <Utensils size={16} className="text-[#e2a85c]" />;
      case 'alchemy': return <FlaskConical size={16} className="text-accent-green" />;
      case 'tech': return <GitMerge size={16} className="text-border-gold" />;
      default: return <Hash size={16} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'character': return 'Personagem';
      case 'cooking': return 'Culinária';
      case 'alchemy': return 'Alquimia';
      case 'tech': return 'Tecnologia';
      default: return type;
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full z-50">
      <div 
        className={cn(
          "flex items-center bg-[rgba(15,12,10,0.8)] border transition-colors",
          isOpen ? "border-border-gold rounded-t-sm" : "border-border-dark rounded-sm hover:border-[rgba(139,107,50,0.5)]"
        )}
      >
        <Search size={18} className="ml-3 text-border-gold opacity-70" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar no Keeper OS..."
          className="w-full bg-transparent border-none p-2 text-text-parchment outline-none font-sans text-sm md:text-base placeholder:text-text-muted"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="p-2 text-text-muted hover:text-accent-red"
          >
            <ChevronRight size={18} className="rotate-180 opacity-0 md:opacity-100" />
          </button>
        )}
      </div>

      {isOpen && query.trim() !== '' && (
        <div className="absolute top-full left-0 w-full bg-[rgba(26,22,20,0.95)] border-x border-b border-border-gold/50 rounded-b-sm shadow-2xl overflow-hidden backdrop-blur-md">
          {results.length > 0 ? (
            <div ref={resultsRef} className="max-h-80 overflow-y-auto custom-scrollbar flex flex-col py-2">
              {results.map((item, index) => (
                <button
                  key={item.type + "-" + item.name}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "flex flex-col text-left px-4 py-3 transition-colors",
                    selectedIndex === index ? "bg-[rgba(139,107,50,0.15)] border-l-4 border-border-gold" : "border-l-4 border-transparent hover:bg-[rgba(255,255,255,0.02)]"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={cn(
                      "font-sans text-base leading-tight",
                      selectedIndex === index ? "text-border-gold" : "text-text-parchment"
                    )}>
                      {item.name}
                    </span>
                    <div className="flex items-center space-x-1.5 opacity-70 bg-[rgba(0,0,0,0.3)] px-2 py-0.5 rounded-full border border-border-dark">
                      {getIcon(item.type)}
                      <span className="text-[10px] font-pixel uppercase tracking-wider hidden sm:inline-block">{getTypeLabel(item.type)}</span>
                    </div>
                  </div>
                  <span className="text-xs text-text-muted truncate mt-1 max-w-[90%] font-sans opacity-80">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-text-muted font-sans text-sm">
              Nenhum resquício encontrado nas tumbas...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
