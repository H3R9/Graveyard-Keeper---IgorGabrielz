import { Utensils } from 'lucide-react';

export default function Cooking() {
  const recipes = [
    { name: 'Muffins', energy: '+20', ingredients: 'Massa + Mel', desc: 'A melhor receita do início do jogo. O mel é fácil de conseguir nas árvores.' },
    { name: 'Vinho de Qualidade (Ouro)', energy: '+40', ingredients: 'Uvas (Ouro)', desc: 'Excelente para energia e para vender na Taverna. Dá o buff "Lentidão do Vinho".' },
    { name: 'Bolo', energy: '+95', ingredients: 'Massa + Mel + Frutas Silvestres', desc: 'A melhor comida para longas expedições na masmorra.' },
    { name: 'Sopa de Abóbora', energy: '+35', ingredients: 'Abóbora + Leite', desc: 'Fácil de fazer quando você tem uma fazenda estabelecida.' },
    { name: 'Cebolas Fritas', energy: '+15', ingredients: 'Cebola', desc: 'Comida de emergência. Plante muitas cebolas no início.' },
    { name: 'Hambúrguer', energy: '+35', ingredients: 'Pão + Carne Assada + Cebola', desc: 'Bom uso para a carne que você tira dos corpos (se tiver o carimbo).' },
  ];

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
          {recipes.map((recipe, idx) => (
            <div key={idx} className="border-2 border-border-dark p-4 hover:border-border-gold transition-colors bg-[rgba(26,22,20,0.8)] relative overflow-hidden">
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
