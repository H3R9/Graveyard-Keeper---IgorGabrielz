import { Utensils } from 'lucide-react';
import { cookingRecipes } from '../data/gameData';

export default function Cooking() {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center space-x-3 mb-6 border-b-4 border-border-dark pb-2">
        <Utensils className="text-border-gold" size={32} />
        <h2 className="text-4xl text-border-gold text-shadow-md">
          Culinária e Sobrevivência
        </h2>
      </div>
      
      <div className="bg-[rgba(0,0,0,0.5)] border-4 border-border-dark p-6 mb-6">
        <p className="text-text-parchment text-2xl mb-4 border-l-4 border-border-gold pl-4">
          "Trabalhar cansa. Dormir gasta tempo. Cozinhar é o segredo para a produtividade infinita. Construa um forno assim que possível."
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cookingRecipes.map((recipe, idx) => (
            <div 
              key={idx} 
              id={`cooking-${recipe.name.replace(/\s+/g, '-').toLowerCase()}`}
              className="border-2 border-border-dark p-4 hover:border-border-gold transition-colors bg-[rgba(26,22,20,0.8)] relative overflow-hidden scroll-mt-24"
            >
              <div className="absolute top-0 right-0 bg-border-dark text-accent-green px-3 py-1 text-xl font-bold border-b-2 border-l-2 border-border-dark">
                {recipe.energy} E
              </div>
              <h3 className="text-2xl text-border-gold mb-1 pr-12">{recipe.name}</h3>
              <p className="text-lg text-accent-blue uppercase tracking-wider mb-2">{recipe.ingredients}</p>
              <p className="text-xl text-text-parchment opacity-90">{recipe.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
