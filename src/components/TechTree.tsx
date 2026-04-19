import { useState, useEffect } from 'react';
import { GitMerge, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { cn } from '../lib/utils';
import { techPriorities } from '../data/gameData';

export default function TechTree() {
  const { user } = useAuth();
  const [unlockedTechs, setUnlockedTechs] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const techsRef = doc(db, 'userTechs', user.uid);
    const unsubscribe = onSnapshot(techsRef, (docSnap) => {
      if (docSnap.exists()) {
        setUnlockedTechs(docSnap.data().unlockedTechs || []);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'userTechs');
    });

    return () => unsubscribe();
  }, [user]);

  const toggleTech = async (techId: string, isCurrentlyUnlocked: boolean, isLockedByReqs: boolean) => {
    if (!user || isLockedByReqs || isSaving) return;

    let newUnlocked = [...unlockedTechs];
    if (isCurrentlyUnlocked) {
      // Remove tech and cascade removal to technologies that depend on this
      const cascadeRemove = (idToRemove: string, currentList: string[]) => {
        let updatedList = currentList.filter(id => id !== idToRemove);
        let changes = true;
        while (changes) {
          changes = false;
          // Find any unlocked tech whose reqs are no longer met
          const dependentTech = techPriorities.flatMap(p => p.techs).find(t => 
            updatedList.includes(t.id) && t.reqs.some(req => !updatedList.includes(req))
          );
          if (dependentTech) {
            updatedList = updatedList.filter(id => id !== dependentTech.id);
            changes = true;
          }
        }
        return updatedList;
      };
      newUnlocked = cascadeRemove(techId, newUnlocked);
    } else {
      // Add tech
      newUnlocked.push(techId);
    }

    setIsSaving(true);
    setUnlockedTechs(newUnlocked); // Optimistic UI

    try {
      const techsRef = doc(db, 'userTechs', user.uid);
      await setDoc(techsRef, {
        unlockedTechs: newUnlocked,
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'userTechs');
    } finally {
      setIsSaving(false);
    }
  };

  const totalTechs = techPriorities.reduce((acc, p) => acc + p.techs.length, 0);
  const unlockedCount = unlockedTechs.length;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-border-dark pb-3 mb-6">
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <GitMerge className="text-border-gold" size={32} />
          <h2 className="text-3xl font-pixel text-border-gold text-shadow-md uppercase tracking-wider">
            Árvore de Tecnologias
          </h2>
        </div>
        
        <div className="flex items-center space-x-3 bg-[rgba(26,22,20,0.8)] border border-border-dark px-4 py-2 rounded-sm text-text-parchment">
          <span className="font-pixel uppercase text-sm tracking-widest text-[#d9c9a0]">Progresso:</span>
          <span className={cn(
            "font-mono text-xl",
            unlockedCount === totalTechs ? "text-accent-green" : "text-border-gold"
          )}>
            {unlockedCount} <span className="text-text-muted text-lg">/</span> {totalTechs}
          </span>
        </div>
      </div>
      
      {!user && (
        <div className="bg-[rgba(15,12,10,0.8)] border border-border-gold/50 p-4 mb-6 rounded-sm flex items-start gap-3">
          <Lock className="text-border-gold shrink-0 mt-0.5" size={18} />
          <p className="text-sm font-pixel text-[#d9c9a0]/80">
            Conecte-se ao Além-Túmulo para registrar seu progresso tecnológico e destrancar os selos.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {techPriorities.map((phase, idx) => (
          <div key={idx} className="bg-[rgba(15,12,10,0.6)] border border-border-dark p-6 rounded-sm relative overflow-hidden">
            <h3 className="text-2xl font-pixel uppercase tracking-wide text-accent-red mb-4 border-b border-[rgba(58,38,24,0.6)] pb-2">{phase.phase}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {phase.techs.map((tech) => {
                const isUnlocked = unlockedTechs.includes(tech.id);
                // Locked visually if any requirement is NOT in unlockedTechs
                const isLockedByReqs = tech.reqs.some(req => !unlockedTechs.includes(req));
                
                return (
                  <div 
                    key={tech.id} 
                    id={`tech-${tech.id}`}
                    className={cn(
                      "border p-4 relative transition-all group flex flex-col scroll-mt-24",
                      isUnlocked 
                        ? "bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.3)] opacity-60 hover:opacity-80" 
                        : isLockedByReqs 
                          ? "bg-[rgba(10,8,6,0.8)] border-[rgba(58,38,24,0.4)] opacity-50 grayscale cursor-not-allowed" 
                          : "bg-[rgba(26,22,20,0.8)] border-border-dark hover:border-[rgba(166,124,61,0.5)] cursor-pointer"
                    )}
                    onClick={() => toggleTech(tech.id, isUnlocked, isLockedByReqs)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={cn(
                        "text-xl font-pixel transition-colors pr-8",
                        isUnlocked ? "text-[#10b981]" : isLockedByReqs ? "text-text-muted" : "text-border-gold"
                      )}>
                        {tech.name}
                      </h4>
                      
                      <div className="shrink-0">
                        {isUnlocked ? (
                          <CheckCircle className="text-[#10b981]" size={24} />
                        ) : isLockedByReqs ? (
                          <Lock className="text-text-muted" size={24} />
                        ) : (
                          <div className={cn(
                            "w-6 h-6 border-2 border-[rgba(139,107,50,0.3)] rounded-full transition-colors",
                            user ? "group-hover:border-border-gold group-hover:bg-[rgba(139,107,50,0.1)]" : ""
                          )} />
                        )}
                      </div>
                    </div>
                    
                    <p className={cn(
                      "text-sm leading-relaxed mt-auto font-sans",
                      isUnlocked ? "text-[#10b981]/70" : "text-text-parchment opacity-80"
                    )}>{tech.desc}</p>
                    
                    {tech.reqs.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-[rgba(255,255,255,0.05)] flex flex-wrap gap-1">
                        <span className="text-[10px] font-pixel text-text-muted uppercase tracking-widest mr-1 mt-0.5">Reqs:</span>
                        {tech.reqs.map(reqId => {
                          const reqTech = techPriorities.flatMap(p => p.techs).find(t => t.id === reqId);
                          const reqUnlocked = unlockedTechs.includes(reqId);
                          return (
                            <span 
                              key={reqId} 
                              className={cn(
                                "text-[10px] font-pixel uppercase px-1.5 py-0.5 rounded-sm border",
                                reqUnlocked 
                                  ? "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-[#10b981]/80" 
                                  : "bg-[rgba(223,68,68,0.1)] border-[rgba(223,68,68,0.3)] text-[#df4444]/80"
                              )}
                            >
                              {reqTech?.name || reqId}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
