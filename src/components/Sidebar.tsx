import { Book, BookOpen, Calendar, Users, MessageSquare, FlaskConical, ListTodo, Utensils, GitMerge, LogIn, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  playSound: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, playSound }: SidebarProps) {
  const { user, login, logout } = useAuth();

  const tabs = [
    { id: 'guide', label: 'Guia Inicial', icon: Book },
    { id: 'advanced', label: 'Guia Avançado', icon: BookOpen },
    { id: 'techtree', label: 'Tecnologias', icon: GitMerge },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'characters', label: 'Personagens', icon: Users },
    { id: 'alchemy', label: 'Alquimia', icon: FlaskConical },
    { id: 'cooking', label: 'Culinária', icon: Utensils },
    { id: 'tasks', label: 'Anotações', icon: ListTodo },
    { id: 'chat', label: 'Chat com IA', icon: MessageSquare },
  ];

  const handleTabClick = (id: string) => {
    playSound();
    setActiveTab(id);
  };

  return (
    <div className="flex flex-col h-full bg-panel-bg">
      <div className="hidden md:block p-6 border-b border-border-dark bg-[rgba(0,0,0,0.3)]">
        <h1 className="text-3xl text-border-gold text-center uppercase tracking-[2px] font-pixel drop-shadow-[1px_1px_0px_black]">
          Menu
        </h1>
        <span className="text-sm font-pixel text-center mt-2 text-accent-blue block uppercase">
          Módulos
        </span>
      </div>
      <nav className="flex md:flex-col flex-row flex-none md:flex-1 p-2 md:p-4 space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto custom-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "flex-none md:w-full flex items-center space-x-2 md:space-x-3 px-3 py-2 md:px-4 md:py-3 transition-all text-left border rounded-sm md:rounded-none whitespace-nowrap",
                isActive 
                  ? "bg-[rgba(139,107,50,0.15)] text-border-gold border-border-gold shadow-[inset_0_0_10px_rgba(139,107,50,0.2)]" 
                  : "bg-[rgba(0,0,0,0.4)] text-text-muted border-border-dark hover:border-border-gold hover:text-text-parchment"
              )}
            >
              <Icon size={18} className={isActive ? "text-border-gold" : "opacity-70"} />
              <span className="text-sm md:text-base font-medium tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="hidden md:flex p-4 border-t border-border-dark bg-[rgba(0,0,0,0.3)] flex-col items-center mt-auto">
        {user ? (
          <div className="w-full flex flex-col items-center">
            <span className="text-xs font-pixel text-accent-green mb-2 truncate w-full text-center uppercase">
              Guardião: {user.displayName || user.email}
            </span>
            <button 
              onClick={() => { playSound(); logout(); }}
              className="w-full flex items-center justify-center space-x-2 bg-bg-dark text-text-parchment px-4 py-2 border border-border-gold hover:bg-accent-red hover:text-white transition-colors text-sm font-medium"
            >
              <LogOut size={16} />
              <span>Desconectar</span>
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <span className="text-xs font-pixel text-accent-red mb-2 uppercase">
              Status: Offline
            </span>
            <button 
              onClick={() => { playSound(); login(); }}
              className="w-full flex items-center justify-center space-x-2 bg-bg-dark text-text-parchment px-4 py-2 border border-border-gold hover:bg-accent-blue hover:text-white transition-colors text-sm font-medium"
            >
              <LogIn size={16} />
              <span>Conectar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}





