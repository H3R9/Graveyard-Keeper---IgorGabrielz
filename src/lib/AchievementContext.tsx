import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import { doc, onSnapshot, setDoc, getDoc, collection, getDocs, updateDoc, increment } from 'firebase/firestore';
import { ACHIEVEMENTS, AppStats, defaultStats } from '../data/achievements';
import { useToast } from './ToastContext';

interface AchievementContextType {
  stats: AppStats;
  unlockedAchievements: string[];
  trackEvent: (key: keyof AppStats, subKey?: string, amount?: number) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function useAchievements() {
  const ctx = useContext(AchievementContext);
  if (!ctx) throw new Error('useAchievements must be used within AchievementProvider');
  return ctx;
}

export function AchievementProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [stats, setStats] = useState<AppStats>(defaultStats);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const hasLoadedRef = useRef(false);

  // Load stats and unlocked achievements from DB on auth
  useEffect(() => {
    if (!user) {
      setStats(defaultStats);
      setUnlockedAchievements([]);
      hasLoadedRef.current = false;
      return;
    }

    let unmounted = false;

    // Listen to combined stats
    const statsRef = doc(db, 'stats', user.uid);
    const unsubStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // merge with defaults to avoid undefined
        setStats(prev => ({
          ...defaultStats,
          ...data,
          tabVisits: { ...defaultStats.tabVisits, ...(data.tabVisits || {}) }
        }));
      }
      hasLoadedRef.current = true;
    }, (error) => {
      console.error("Stats snapshot error:", error);
    });

    // We only load achievements once on boot to avoid loops, or via snapshot if we prefer
    // Handled in the second effect

    return () => {
      unmounted = true;
      unsubStats();
    };
  }, [user]);

  // Use a second effect strictly for the achievements collection
  useEffect(() => {
    if (!user) return;
    const achievementsRef = collection(db, 'users', user.uid, 'achievements');
    const unsubAch = onSnapshot(achievementsRef, (snap) => {
      const unlocked = snap.docs.map(doc => doc.id);
      setUnlockedAchievements(unlocked);
    }, (error) => {
      console.error("Achievements snapshot error:", error);
    });
    return () => unsubAch();
  }, [user]);

  // Evaluate conditions when stats change
  useEffect(() => {
    if (!user || !hasLoadedRef.current) return;

    let newlyUnlocked: string[] = [];

    // Evaluate normal achievements
    for (const ach of ACHIEVEMENTS) {
      if (ach.id !== 'master_keeper' && !unlockedAchievements.includes(ach.id)) {
        if (ach.condition(stats)) {
          newlyUnlocked.push(ach.id);
        }
      }
    }

    // Evaluate master keeper
    if (!unlockedAchievements.includes('master_keeper') && !newlyUnlocked.includes('master_keeper')) {
       const allOthersUnlocked = ACHIEVEMENTS.filter(a => a.id !== 'master_keeper').every(a => unlockedAchievements.includes(a.id) || newlyUnlocked.includes(a.id));
       if (allOthersUnlocked && ACHIEVEMENTS.length > 1) { // ensuring it doesn't unlock on empty state
         newlyUnlocked.push('master_keeper');
       }
    }

    if (newlyUnlocked.length > 0) {
      // Avoid loops
      const currentNew = [...newlyUnlocked];
      currentNew.forEach(async id => {
        try {
          const achDef = ACHIEVEMENTS.find(a => a.id === id);
          if (achDef) {
            addToast(`🏆 Conquista Desbloqueada: ${achDef.title}`, 'achievement');
            const docRef = doc(db, 'users', user.uid, 'achievements', id);
            await setDoc(docRef, { unlockedAt: Date.now() }, { merge: true });
          }
        } catch (e) {
          console.error("Failed to save achievement", e);
        }
      });
    }

  }, [stats, unlockedAchievements, user, addToast]);

  const trackEvent = async (key: keyof AppStats, subKey?: string, amount: number = 1) => {
    if (!user) return;

    // Optimistic update locally
    setStats(prev => {
      const next = { ...prev };
      if (key === 'tabVisits' && subKey) {
        next.tabVisits = { ...next.tabVisits };
        next.tabVisits[subKey] = (next.tabVisits[subKey] || 0) + amount;
      } else if (typeof next[key] === 'number') {
        (next as any)[key] += amount;
      }
      return next;
    });

    // Write to Firestore
    try {
      const statsRef = doc(db, 'stats', user.uid); // Rule gives access to /stats/{docId}
      const snap = await getDoc(statsRef);
      if (!snap.exists()) {
        // Initialize
        const initial = { ...defaultStats };
        if (key === 'tabVisits' && subKey) initial.tabVisits[subKey] = amount;
        else if (typeof initial[key] === 'number') (initial as any)[key] = amount;
        await setDoc(statsRef, initial);
      } else {
        // Update
        if (key === 'tabVisits' && subKey) {
          await updateDoc(statsRef, {
            [`tabVisits.${subKey}`]: increment(amount)
          });
        } else {
          await updateDoc(statsRef, {
            [key]: increment(amount)
          });
        }
      }
    } catch (e) {
      console.error("TrackEvent failed", e);
    }
  };

  return (
    <AchievementContext.Provider value={{ stats, unlockedAchievements, trackEvent }}>
      {children}
    </AchievementContext.Provider>
  );
}
