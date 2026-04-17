import { days } from '../data/gameData';
import { cn } from '../lib/utils';

export default function Calendar() {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-4xl text-border-gold mb-6 border-b-4 border-border-dark pb-2 text-shadow-md">
        O Ciclo Semanal
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day) => (
          <div 
            key={day.name} 
            className="bg-[rgba(0,0,0,0.5)] border-4 border-border-dark flex flex-col hover:border-border-gold transition-colors"
          >
            <div className={cn(
              "h-2 w-full",
              day.color === 'pride' && "bg-purple-500",
              day.color === 'lust' && "bg-red-500",
              day.color === 'gluttony' && "bg-orange-500",
              day.color === 'envy' && "bg-green-500",
              day.color === 'wrath' && "bg-red-900",
              day.color === 'sloth' && "bg-blue-500"
            )} />
            <div className="p-4 flex-1 flex flex-col items-center text-center">
              <div className="w-20 h-20 mb-3 border-4 border-border-dark flex items-center justify-center overflow-hidden bg-[#2c2522]">
                <img 
                  src={day.image} 
                  alt={day.name} 
                  className="w-full h-full object-contain pixelated"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/graveyard/100/100';
                  }}
                />
              </div>
              <h3 className="text-3xl text-border-gold mb-1">{day.name}</h3>
              <p className="text-lg text-accent-blue uppercase tracking-wider mb-3">{day.npc}</p>
              <p className="text-xl text-text-parchment mt-auto">{day.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


