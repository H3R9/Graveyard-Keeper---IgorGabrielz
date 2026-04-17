import { FlaskConical } from 'lucide-react';

export default function Alchemy() {
  const recipes = [
    { name: 'Pó de Grafite', ingredients: 'Minério de Ferro (Moedor)', desc: 'Usado para criar tinta preta.' },
    { name: 'Tinta Preta', ingredients: 'Pó de Grafite + Água + Frasco', desc: 'Essencial para escrever notas e livros.' },
    { name: 'Poção de Energia', ingredients: 'Pó de Aceleração + Solução de Aceleração', desc: 'Restaura 50 de Energia.' },
    { name: 'Poção de Saúde', ingredients: 'Pó de Vida + Solução de Vida', desc: 'Restaura 50 de Saúde.' },
    { name: 'Suco de Zumbi', ingredients: 'Pó de Saúde + Sangue', desc: 'Usado para ressuscitar corpos como Zumbis.' },
    { name: 'Injeção de Cola', ingredients: 'Pó de Saúde + Solução de Vida + Extrato de Caos', desc: 'Adiciona 1 Caveira Branca ao corpo.' },
    { name: 'Injeção de Prata', ingredients: 'Pó de Ordem + Solução de Ordem + Extrato de Vida', desc: 'Remove 1 Caveira Vermelha e adiciona 1 Branca.' },
    { name: 'Injeção de Ouro', ingredients: 'Pó de Ordem + Solução Tóxica + Extrato de Caos', desc: 'Remove 2 Caveiras Vermelhas e adiciona 2 Brancas.' },
    { name: 'Ácido', ingredients: 'Pó Tóxico + Solução Tóxica + Extrato Tóxico', desc: 'Usado para criar injeções ácidas.' },
    { name: 'Tempero (Spice)', ingredients: 'Pó de Saúde + Solução Tóxica + Extrato de Vida', desc: 'Usado para fazer refeições de alta qualidade.' }
  ];

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
          {recipes.map((recipe, idx) => (
            <div key={idx} className="border-2 border-border-dark p-4 hover:border-border-gold transition-colors bg-[rgba(26,22,20,0.8)]">
              <h3 className="text-2xl text-border-gold mb-1">{recipe.name}</h3>
              <p className="text-lg text-accent-green uppercase tracking-wider mb-2">{recipe.ingredients}</p>
              <p className="text-xl text-text-parchment opacity-90">{recipe.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

