import { useState } from 'react';
import { craftingRecipes, CraftingRecipe } from '../data/gameData';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Hammer, Clock, Search, ListTree, Box, Wrench } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAchievements } from '../lib/AchievementContext';

export default function CraftCalculator() {
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { trackEvent } = useAchievements();
  
  const [baseMaterials, setBaseMaterials] = useState<Record<string, number>>({});
  const [intermediateCrafts, setIntermediateCrafts] = useState<Record<string, number>>({});
  const [totalTime, setTotalTime] = useState<number>(0);

  const allItemIds = Object.keys(craftingRecipes);
  
  const filteredItems = searchTerm 
    ? allItemIds.filter(id => craftingRecipes[id].name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const handleSelect = (id: string) => {
    setSelectedItem(id);
    setSearchTerm(craftingRecipes[id].name);
  };

  const calculateRequirements = (itemId: string, neededQuantity: number, currentBase: Record<string, number>, currentInter: Record<string, number>, timeAcc: { current: number }) => {
    const recipe = craftingRecipes[itemId];
    
    // Se não tem receita, é material base
    if (!recipe) {
      currentBase[itemId] = (currentBase[itemId] || 0) + neededQuantity;
      return;
    }

    // Calcular quantas vezes precisamos craftar esta receita
    const craftsNeeded = Math.ceil(neededQuantity / recipe.yield);
    const amountProduced = craftsNeeded * recipe.yield;

    // Acumula os crafts intermediários e o tempo
    currentInter[itemId] = (currentInter[itemId] || 0) + amountProduced;
    timeAcc.current += craftsNeeded * recipe.timeSeconds;

    // Resolução recursiva para os ingredientes (Busca em Profundidade DFS)
    for (const ingredient of recipe.ingredients) {
      const requiredAmount = ingredient.amount * craftsNeeded;
      calculateRequirements(ingredient.id, requiredAmount, currentBase, currentInter, timeAcc);
    }
  };

  const doCalculate = () => {
    if (!selectedItem || quantity < 1) return;

    const newBase: Record<string, number> = {};
    const newInter: Record<string, number> = {};
    const timeAcc = { current: 0 };

    calculateRequirements(selectedItem, quantity, newBase, newInter, timeAcc);

    // Remove o final item do intermediário, pois ele é o resultado final
    if (newInter[selectedItem]) {
       delete newInter[selectedItem];
    }

    setBaseMaterials(newBase);
    setIntermediateCrafts(newInter);
    setTotalTime(timeAcc.current);
    trackEvent('craftCalculations');
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const min = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${min}m ${s}s`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col h-full gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border-dark pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <Calculator className="text-border-gold" size={32} />
          <h2 className="text-3xl text-border-gold font-pixel drop-shadow-sm uppercase">
            Calculadora de Craft
          </h2>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-[rgba(18,14,12,0.6)] border border-border-dark p-6 rounded-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          
          <div className="w-full relative">
            <label className="font-pixel text-xs text-text-muted uppercase tracking-wider mb-2 block">Item Alvo</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedItem(null); // Reset selection on type
                }}
                className="w-full bg-bg-dark border border-border-dark text-text-parchment p-3 pl-10 rounded-sm focus:border-border-gold outline-none"
                placeholder="Ex: Fornalha III..."
              />
            </div>

            {/* Autocomplete Dropdown */}
            {searchTerm && !selectedItem && filteredItems.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-panel-bg border border-border-dark shadow-xl z-50 rounded-sm">
                {filteredItems.map(id => (
                  <li 
                    key={id}
                    onClick={() => handleSelect(id)}
                    className="p-3 border-b border-border-dark/50 hover:bg-bg-dark text-text-parchment cursor-pointer text-sm"
                  >
                    {craftingRecipes[id].name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="w-full lg:w-48">
            <label className="font-pixel text-xs text-text-muted uppercase tracking-wider mb-2 block">Quantidade</label>
            <input 
              type="number" 
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-bg-dark border border-border-dark text-text-parchment p-3 rounded-sm focus:border-border-gold outline-none"
            />
          </div>

          <button
            onClick={doCalculate}
            disabled={!selectedItem}
            className="w-full lg:w-auto bg-bg-dark border border-border-gold text-border-gold hover:bg-border-gold hover:text-bg-dark font-pixel uppercase px-6 py-3 rounded-sm transition-all shadow-[0_0_15px_rgba(139,107,50,0.1)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Hammer size={18} />
            Calcular Recursão
          </button>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence mode="popLayout">
        {totalTime > 0 && selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 space-y-6"
          >
            {/* Banner Result */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-gradient-to-r from-[rgba(139,107,50,0.15)] to-transparent border-l-4 border-border-gold p-4 mt-2 flex items-center justify-between">
                  <div>
                    <span className="font-pixel text-[10px] uppercase text-text-muted block tracking-widest">Produzindo</span>
                    <h3 className="text-xl text-border-gold">{quantity}x {craftingRecipes[selectedItem].name}</h3>
                  </div>
               </div>
               
               <div className="bg-[rgba(18,14,12,0.8)] border border-border-dark p-4 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3">
                    <Clock className="text-accent-blue" size={24} />
                    <div>
                      <span className="font-pixel text-[10px] uppercase text-text-muted block tracking-widest">Tempo Base Estimado</span>
                      <h3 className="text-xl text-text-parchment">{formatTime(totalTime)}</h3>
                    </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Materiais Base Tabela */}
              <div className="border border-border-dark bg-panel-bg/30">
                <div className="flex items-center gap-2 p-3 border-b border-border-dark bg-[rgba(18,14,12,0.8)]">
                  <Box className="text-border-gold" size={18} />
                  <h4 className="font-pixel text-sm uppercase tracking-widest">Materiais Base (Farm)</h4>
                </div>
                <ul className="p-4 space-y-2">
                  {Object.entries(baseMaterials).map(([id, amount]) => (
                    <li key={id} className="flex justify-between items-center text-sm border-b border-border-dark/30 pb-2 last:border-0 last:pb-0">
                       <span className="text-text-parchment">{craftingRecipes[id]?.name || id}</span>
                       <span className="font-mono text-accent-green bg-accent-green/10 px-2 py-0.5 rounded-sm">x{amount}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sub-Crafts Tabela */}
              <div className="border border-border-dark bg-panel-bg/30">
                <div className="flex items-center gap-2 p-3 border-b border-border-dark bg-[rgba(18,14,12,0.8)]">
                  <Wrench className="text-accent-blue" size={18} />
                  <h4 className="font-pixel text-sm uppercase tracking-widest">Passos Intermediários</h4>
                </div>
                <div className="p-4">
                  {Object.keys( intermediateCrafts ).length > 0 ? (
                    <ul className="space-y-2">
                      {Object.entries(intermediateCrafts).map(([id, amount]) => (
                        <li key={id} className="flex justify-between items-center text-sm border-b border-border-dark/30 pb-2 last:border-0 last:pb-0">
                          <span className="text-text-parchment">{craftingRecipes[id]?.name || id}</span>
                          <span className="font-mono text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded-sm">x{amount}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs italic text-text-muted max-w-[200px]">Nenhum sub-craft necessário para este item principal.</p>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
