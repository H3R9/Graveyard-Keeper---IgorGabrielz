import { GitMerge } from 'lucide-react';

export default function TechTree() {
  const priorities = [
    { 
      phase: 'Início do Jogo (Sobrevivência)', 
      techs: [
        { name: 'Serraria e Corte de Madeira', desc: 'Essencial para fazer tábuas e lenha.' },
        { name: 'Corte de Pedra', desc: 'Para consertar túmulos e construir a fornalha.' },
        { name: 'Fornalha Simples', desc: 'Para derreter ferro e fazer pregos.' },
        { name: 'Crematório', desc: 'A salvação para corpos ruins (caveiras vermelhas/verdes). Queime-os para obter sal e cinzas.' }
      ]
    },
    { 
      phase: 'Meio do Jogo (Expansão)', 
      techs: [
        { name: 'Igreja Nível 2', desc: 'Aumenta muito a fé gerada nos sermões.' },
        { name: 'Zumbis (Breaking Dead)', desc: 'Fale com Gunter. Automatize a coleta de madeira e pedra.' },
        { name: 'Mesa de Estudo', desc: 'A principal fonte de Pontos Azuis. Estude partes de corpos e lápides.' },
        { name: 'Vidro e Frascos', desc: 'Necessário para alquimia e gera pontos azuis passivamente.' }
      ]
    },
    { 
      phase: 'Late Game (Otimização)', 
      techs: [
        { name: 'Mesa de Embalsamamento', desc: 'O segredo para corpos de 16 caveiras brancas.' },
        { name: 'Escritor Fantasma', desc: 'Faça livros para gerar pontos azuis infinitos.' },
        { name: 'Cultista', desc: 'Permite ver os modificadores exatos dos órgãos (Cérebro, Coração, Intestino).' },
        { name: 'Mármore', desc: 'Para criar os melhores túmulos e estátuas.' }
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center space-x-3 mb-6 border-b-4 border-border-dark pb-2">
        <GitMerge className="text-border-gold" size={32} />
        <h2 className="text-4xl text-border-gold text-shadow-md">
          Árvore de Tecnologias
        </h2>
      </div>
      
      <div className="space-y-6">
        {priorities.map((phase, idx) => (
          <div key={idx} className="bg-[rgba(0,0,0,0.5)] border-4 border-border-dark p-6">
            <h3 className="text-3xl text-accent-red mb-4 border-b-2 border-border-dark pb-2">{phase.phase}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {phase.techs.map((tech, tIdx) => (
                <div key={tIdx} className="border-2 border-border-dark p-4 bg-[rgba(26,22,20,0.8)] border-l-4 border-l-border-gold">
                  <h4 className="text-2xl text-border-gold mb-1">{tech.name}</h4>
                  <p className="text-xl text-text-parchment opacity-90">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
