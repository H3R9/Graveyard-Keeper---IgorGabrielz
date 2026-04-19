import { Book, BookOpen, Calendar, Users, MessageSquare, FlaskConical, ListTodo, Utensils, GitMerge, LogIn, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { useNavigation } from '../lib/NavigationContext';
import { useToast } from '../lib/ToastContext';
import { motion } from 'motion/react';
import { routeImports } from '../App';

export default function Sidebar() {
  const { user, login, logout } = useAuth();
  const { activeTab, setActiveTab, playSound } = useNavigation();
  const { addToast } = useToast();

  const tabs = [
    { id: 'guide', label: 'Guia', icon: Book },
    { id: 'advanced', label: 'Avançado', icon: BookOpen },
    { id: 'techtree', label: 'Techs', icon: GitMerge },
    { id: 'calendar', label: 'Tempo', icon: Calendar },
    { id: 'characters', label: 'NPCs', icon: Users },
    { id: 'alchemy', label: 'Alquimia', icon: FlaskConical },
    { id: 'cooking', label: 'Cozinha', icon: Utensils },
    { id: 'tasks', label: 'Notas', icon: ListTodo },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ];

  const handleTabClick = (id: string) => {
    playSound();
    setActiveTab(id);
  };

  const handlePrefetch = (id: string) => {
    if (routeImports[id as keyof typeof routeImports]) {
      routeImports[id as keyof typeof routeImports]();
    }
  };

  return (
    <>
      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-panel-bg/95 backdrop-blur-md border-t border-border-dark shadow-[0_-5px_20px_rgba(0,0,0,0.8)] z-[60]">
        <nav className="flex items-end h-[68px] w-full px-2 pb-2 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={`mobile-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                onTouchStart={() => handlePrefetch(tab.id)}
                className="relative flex-shrink-0 flex flex-col items-center justify-center w-[72px] h-full pt-2 group"
              >
                <div className={cn(
                  "flex flex-col items-center justify-center transition-all duration-300",
                  isActive ? "text-border-gold -translate-y-1" : "text-text-muted hover:text-text-parchment"
                )}>
                  <Icon size={isActive ? 22 : 20} className={isActive ? "drop-shadow-[0_0_8px_rgba(166,124,61,0.6)] mb-1" : "mb-1 opacity-70"} />
                  <span className={cn(
                    "text-[10px] font-medium tracking-tight transition-all duration-300",
                    isActive ? "opacity-100" : "opacity-0 translate-y-2 group-hover:opacity-70 group-hover:translate-y-0"
                  )}>
                    {tab.label}
                  </span>
                </div>
                
                {/* Sliding Underline - Framer Motion */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-tab"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-border-gold rounded-t-full shadow-[0_-2px_10px_rgba(166,124,61,0.8)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Desktop/Tablet Sidebar (Bento Grid Lateral) */}
      <div className="hidden md:flex flex-col w-20 lg:w-64 flex-shrink-0 h-full overflow-y-auto overflow-x-visible bento-card z-30 transition-all duration-300">
        <div className="p-4 lg:p-6 border-b border-border-dark bg-[rgba(0,0,0,0.3)] flex flex-col items-center">
          <h1 className="text-xl lg:text-3xl text-border-gold text-center uppercase tracking-[2px] font-pixel drop-shadow-[1px_1px_0px_black] title-flicker truncate w-full">
            <span className="lg:hidden">OS</span>
            <span className="hidden lg:inline">Menu</span>
          </h1>
          <span className="hidden lg:block text-sm font-pixel text-center mt-2 text-accent-blue uppercase title-flicker">
            Módulos
          </span>
        </div>
        
        <nav className="flex flex-col flex-1 p-2 lg:p-4 space-y-2 overflow-y-auto overflow-x-visible custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={`desktop-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                onMouseEnter={() => handlePrefetch(tab.id)}
                className={cn(
                  "group relative w-full flex justify-center lg:justify-start items-center lg:space-x-3 p-3 transition-all text-left border rounded-sm lg:rounded-none",
                  isActive 
                    ? "bg-[rgba(139,107,50,0.15)] text-border-gold border-border-gold shadow-[inset_0_0_10px_rgba(139,107,50,0.2)]" 
                    : "bg-[rgba(0,0,0,0.4)] text-text-muted border-border-dark hover:border-border-gold hover:text-text-parchment"
                )}
              >
                <Icon size={20} className={isActive ? "text-border-gold" : "opacity-70"} />
                
                {/* Texto apenas Visível em telas grandes (lg) */}
                <span className="hidden lg:inline-block text-sm font-medium tracking-wide">
                  {tab.label}
                </span>

                {/* Tooltip Visível Apenas no layout Colapsado (md) ao Hover */}
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-bg-dark border border-border-gold text-text-parchment text-xs font-pixel uppercase tracking-[2px] rounded-sm opacity-0 pointer-events-none transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 hidden md:block lg:hidden z-[100] whitespace-nowrap shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                  {tab.label}
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-3 lg:p-4 border-t border-border-dark bg-[rgba(0,0,0,0.3)] flex flex-col items-center mt-auto">
          {user ? (
            <div className="w-full flex flex-col items-center">
              <span className="hidden lg:block text-[10px] font-pixel text-accent-green mb-2 truncate w-full text-center uppercase">
                {user.displayName || user.email}
              </span>
              <button 
                onClick={async () => { 
                  playSound(); 
                  await logout(); 
                  addToast('Conexão encerrada com o Além-Túmulo.', 'warning');
                }}
                className="group relative w-full flex items-center justify-center lg:space-x-2 bg-bg-dark text-text-parchment p-2 lg:px-4 lg:py-2 border border-border-dark hover:border-border-gold hover:bg-accent-red hover:text-white transition-colors rounded-sm lg:rounded-none"
              >
                <LogOut size={18} />
                <span className="hidden lg:inline-block text-sm font-medium">Sair</span>
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-bg-dark border border-accent-red text-white text-xs font-pixel uppercase tracking-[2px] rounded-sm opacity-0 pointer-events-none transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 hidden md:block lg:hidden z-[100] whitespace-nowrap">
                  Desconectar
                </div>
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <span className="hidden lg:block text-xs font-pixel text-accent-red mb-2 uppercase">
                Offline
              </span>
              <button 
                onClick={async () => { 
                  playSound(); 
                  try {
                    await login(); 
                    addToast('Conectado com sucesso ao Keeper OS.', 'success');
                  } catch (e) {
                    addToast('Falha na autenticação.', 'error');
                  }
                }}
                className="group relative w-full flex items-center justify-center lg:space-x-2 bg-bg-dark text-text-parchment p-2 lg:px-4 lg:py-2 border border-border-dark hover:border-border-gold hover:bg-accent-blue hover:text-white transition-colors rounded-sm lg:rounded-none"
              >
                <LogIn size={18} />
                <span className="hidden lg:inline-block text-sm font-medium">Login</span>
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-bg-dark border border-accent-blue text-white text-xs font-pixel uppercase tracking-[2px] rounded-sm opacity-0 pointer-events-none transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 hidden md:block lg:hidden z-[100] whitespace-nowrap">
                  Conectar
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}





