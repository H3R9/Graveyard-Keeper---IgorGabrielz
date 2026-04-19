import { FlaskConical } from 'lucide-react';
import { alchemyRecipes } from '../data/gameData';
import { useState, useEffect } from 'react';
import { SkeletonKnowledgeRow } from './ui/Skeleton';

export default function Alchemy() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center space-x-3 mb-6 border-b-4 border-border-dark pb-2">
        <FlaskConical className="text-border-gold" size={32} />
        <h2 className="text-4xl text-border-gold text-shadow-md">
          Compêndio de Alquimia
        </h2>
      </div>
      
      <div className="bg-[rgba(0,0,0,0.5)] border-4 border-border-dark p-6 mb-6">
        <p className="text-text-parchment text-2xl mb-4 border-l-4 border-border-gold pl-4">
          "A alquimia é a arte de separar o que é útil do que é inútil. Lembre-se: Pós vêm do Moedor, Soluções do Misturador Manual e Extratos do Destilador."
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonKnowledgeRow key={i} />)
          ) : (
            alchemyRecipes.map((recipe, idx) => (
              <div 
                key={idx} 
                id={`alchemy-${recipe.name.replace(/\s+/g, '-').toLowerCase()}`}
                className="border-2 border-border-dark p-4 hover:border-border-gold transition-colors bg-[rgba(26,22,20,0.8)] scroll-mt-24"
              >
                <h3 className="text-2xl text-border-gold mb-1">{recipe.name}</h3>
                <p className="text-lg text-accent-green uppercase tracking-wider mb-2">{recipe.ingredients}</p>
                <p className="text-xl text-text-parchment opacity-90">{recipe.desc}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

