import { motion } from 'motion/react';
import { Trophy, Lock, Star } from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';
import { useAchievements } from '../lib/AchievementContext';

export default function Achievements() {
  const { stats, unlockedAchievements } = useAchievements();

  // Helper to parse icon string safely
  const renderIcon = (svgString: string, isUnlocked: boolean) => {
    return (
      <div 
        className={`w-10 h-10 flex items-center justify-center rounded-full border ${isUnlocked ? 'border-border-gold bg-[rgba(139,107,50,0.2)] text-border-gold' : 'border-border-dark bg-bg-dark text-text-muted grayscale'}`}
        dangerouslySetInnerHTML={{ __html: svgString }} 
      />
    );
  };

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border-dark pb-4 mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <Trophy className="text-border-gold" size={32} />
          <div>
            <h2 className="text-2xl font-pixel text-border-gold uppercase">Salão de Conquistas</h2>
            <p className="text-sm font-pixel text-text-muted mt-1 uppercase tracking-widest text-[10px]">Ecos das suas ações no Além-Túmulo</p>
          </div>
        </div>
        
        <div className="bg-panel-bg border border-border-dark px-4 py-2 rounded-sm text-center min-w-[150px]">
          <div className="text-xs uppercase font-pixel tracking-widest text-text-muted mb-1">Progresso</div>
          <div className="text-xl font-pixel text-border-gold shadow-sm">{unlockedCount} / {totalCount}</div>
          
          <div className="w-full bg-bg-dark h-2 rounded-full mt-2 border border-border-dark overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-border-gold"
            />
          </div>
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
        {ACHIEVEMENTS.map((ach, index) => {
          const isUnlocked = unlockedAchievements.includes(ach.id);
          
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative p-4 flex gap-4 rounded-sm border backdrop-blur-sm transition-colors ${
                isUnlocked 
                  ? 'bg-[rgba(139,107,50,0.05)] border-border-gold shadow-[0_4px_20px_rgba(139,107,50,0.1)]' 
                  : 'bg-[rgba(18,14,12,0.6)] border-border-dark opacity-60'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {renderIcon(ach.icon, isUnlocked)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-pixel text-[12px] uppercase truncate ${isUnlocked ? 'text-border-gold drop-shadow-sm' : 'text-text-muted'}`}>
                    {ach.title}
                  </h3>
                  {!isUnlocked && <Lock size={12} className="text-text-muted shrink-0" />}
                </div>
                <p className={`text-sm font-sans leading-snug ${isUnlocked ? 'text-text-parchment' : 'text-text-muted'}`}>
                  {isUnlocked ? ach.description : '???'}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
      
    </div>
  );
}
