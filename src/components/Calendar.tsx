import { useState, useEffect } from 'react';
import { days } from '../data/gameData';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Calendar as CalendarIcon, ChevronRight, AlertCircle, Sunrise } from 'lucide-react';
import { useAchievements } from '../lib/AchievementContext';

export default function Calendar() {
  const { user } = useAuth();
  const { trackEvent } = useAchievements();
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const settingsRef = doc(db, 'userSettings', user.uid);
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().currentGameDay) {
        setCurrentDay(docSnap.data().currentGameDay);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'userSettings');
    });

    return () => unsubscribe();
  }, [user]);

  const handleUpdateDay = async (newDay: number) => {
    if (newDay < 1 || isNaN(newDay)) return;
    if (!user) {
      setCurrentDay(newDay);
      return;
    }

    setIsSaving(true);
    // Optimistic UI
    setCurrentDay(newDay);

    try {
      const settingsRef = doc(db, 'userSettings', user.uid);
      await setDoc(settingsRef, {
        currentGameDay: newDay,
        updatedAt: Date.now()
      });
      if (newDay > currentDay) {
        trackEvent('daysAdvanced', undefined, newDay - currentDay);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'userSettings');
    } finally {
      setIsSaving(false);
    }
  };

  const incrementDay = () => {
    handleUpdateDay(currentDay + 1);
  };

  const getCriticalEvent = (npc: string) => {
    switch (npc) {
      case 'Bispo': return { text: 'Missa', color: 'bg-purple-900 border-purple-500 text-purple-200' };
      case 'Inquisidor': return { text: 'Fogueira', color: 'bg-red-900 border-red-500 text-red-200' };
      case 'Astrólogo': return { text: 'Farol (Noite)', color: 'bg-blue-900 border-blue-500 text-blue-200' };
      case 'Mercador': return { text: 'Feira', color: 'bg-orange-900 border-orange-500 text-orange-200' };
      case 'Snake': return { text: 'Subsolo (Noite)', color: 'bg-green-900 border-green-500 text-green-200' };
      case 'Sra. Charm': return { text: 'Taverna', color: 'bg-red-800 border-red-400 text-red-100' };
      default: return null;
    }
  };

  // Generate the next 7 days based on the current day
  const upcomingDays = Array.from({ length: 7 }, (_, i) => {
    const dayNum = currentDay + i;
    // Graveyard Keeper week has 6 days.
    // So day 1 = index 0 (Pride). Day 6 = index 5 (Sloth). Day 7 = index 0 (Pride).
    const weekDayIndex = (dayNum - 1) % 6;
    return {
      dayNum,
      ...days[weekDayIndex]
    };
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border-dark pb-4 mb-6">
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <CalendarIcon className="text-border-gold" size={32} />
          <h2 className="text-3xl text-border-gold font-pixel drop-shadow-sm uppercase">
            A Roda do Tempo
          </h2>
        </div>
        
        <div className="flex items-center bg-[rgba(26,22,20,0.8)] border border-border-dark p-3 rounded-sm space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-text-muted font-pixel text-sm uppercase tracking-wider">
              Dia Atual:
            </label>
            <input
              type="number"
              min="1"
              value={currentDay}
              onChange={(e) => handleUpdateDay(parseInt(e.target.value))}
              className="w-20 bg-[rgba(0,0,0,0.6)] border border-border-dark px-2 py-1 text-center text-border-gold focus:outline-none focus:border-border-gold font-pixel text-lg"
            />
          </div>
          
          <button
            onClick={incrementDay}
            disabled={isSaving}
            className="flex items-center space-x-2 bg-[rgba(139,107,50,0.2)] hover:bg-[rgba(139,107,50,0.4)] border border-[rgba(139,107,50,0.5)] text-border-gold px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            <Sunrise size={18} />
            <span className="font-pixel text-xs uppercase mt-1">Avançar</span>
          </button>
        </div>
      </div>

      <div className="mb-4 text-text-muted italic text-sm">
        Exibindo a previsão astrológica para a próxima semana a partir do Dia {currentDay}. A IA usará este ciclo para planejar.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {upcomingDays.map((day, idx) => {
          const isToday = idx === 0;
          const critEvent = getCriticalEvent(day.npc);

          return (
            <div 
              key={`${day.dayNum}-${idx}`} 
              className={cn(
                "bg-[rgba(0,0,0,0.5)] border-2 flex flex-col transition-all relative overflow-hidden",
                isToday ? "border-border-gold shadow-[0_0_15px_rgba(139,107,50,0.2)] md:col-span-2 xl:col-span-1 xl:scale-105 z-10" : "border-border-dark hover:border-[rgba(139,107,50,0.5)] opacity-90"
              )}
            >
              {isToday && (
                <div className="absolute top-0 right-0 bg-border-gold text-panel-bg text-[10px] font-pixel px-2 py-1 uppercase z-20">
                  HOJE
                </div>
              )}
              
              <div className={cn(
                "h-2 w-full flex-shrink-0",
                day.color === 'pride' && "bg-purple-500",
                day.color === 'lust' && "bg-red-500",
                day.color === 'gluttony' && "bg-orange-500",
                day.color === 'envy' && "bg-green-500",
                day.color === 'wrath' && "bg-red-900",
                day.color === 'sloth' && "bg-blue-500"
              )} />
              
              <div className="p-3 flex-1 flex flex-col items-center text-center">
                <div className="flex w-full justify-between items-center mb-2 px-1">
                  <span className="text-xs font-pixel text-text-muted">Dia {day.dayNum}</span>
                </div>
                
                <div className={cn(
                  "mb-3 border-4 border-[rgba(26,22,20,0.8)] flex items-center justify-center overflow-hidden bg-[rgba(15,12,10,0.8)] rounded-full",
                  isToday ? "w-20 h-20" : "w-16 h-16"
                )}>
                  <img 
                    src={day.image} 
                    alt={day.name} 
                    className="w-full h-full object-contain p-2 hover:scale-110 transition-transform pixelated"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/graveyard/100/100';
                    }}
                  />
                </div>
                
                <h3 className={cn(
                  "font-pixel tracking-wide mb-1 transition-colors",
                  isToday ? "text-xl text-border-gold" : "text-lg text-[#d9c9a0]/70"
                )}>{day.name}</h3>
                
                <p className="text-xs text-accent-blue uppercase tracking-wider mb-3">
                  {day.npc}
                </p>

                {critEvent && (
                  <div className={cn(
                    "mt-auto border text-[10px] font-pixel uppercase px-2 py-1 w-full flex items-center justify-center gap-1",
                    critEvent.color
                  )}>
                    <AlertCircle size={10} />
                    <span className="mt-0.5">{critEvent.text}</span>
                  </div>
                )}
                
                {isToday && (
                  <p className="text-xs text-text-muted mt-3 italic leading-snug">
                    {day.desc}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


