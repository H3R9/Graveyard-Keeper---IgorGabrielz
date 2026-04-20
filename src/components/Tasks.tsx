import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { CheckSquare, Square, Trash2, Plus, ListTodo, GripVertical, ChevronDown, ChevronRight, Search, Lock, Archive } from 'lucide-react';
import Markdown from 'react-markdown';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SkeletonTaskCard } from './ui/Skeleton';
import { useAchievements } from '../lib/AchievementContext';

export type TaskCategory = 'Craft' | 'NPC' | 'Exploração' | 'Igreja' | 'Masmorra' | 'Geral';
export const CATEGORIES: TaskCategory[] = ['Craft', 'NPC', 'Exploração', 'Igreja', 'Masmorra', 'Geral'];

const categoryColors: Record<TaskCategory, string> = {
  Craft: 'bg-[#8b6b32]/20 text-[#d9c9a0] border-[#8b6b32]/50',
  NPC: 'bg-[#5c9ac4]/20 text-[#5c9ac4] border-[#5c9ac4]/50',
  Exploração: 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/50',
  Igreja: 'bg-[#a78bfa]/20 text-[#a78bfa] border-[#a78bfa]/50',
  Masmorra: 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/50',
  Geral: 'bg-white/5 text-text-muted border-white/10'
};

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  order?: number;
  category?: TaskCategory;
}

interface Memory {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

function SortableTaskItem({ task, toggleTask, deleteTask, isDraggable }: { task: Task, toggleTask: (task: Task) => void, deleteTask: (id: string) => void, isDraggable: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const cat = task.category || 'Geral';
  const catStyle = categoryColors[cat];

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex items-center justify-between p-3 border transition-colors relative ${
        isDragging ? 'opacity-80 shadow-lg border-border-gold scale-[1.02]' : ''
      } ${
        task.completed 
          ? 'bg-[rgba(0,0,0,0.3)] border-border-dark opacity-60' 
          : 'bg-[rgba(26,22,20,0.6)] border-[rgba(166,124,61,0.5)]'
      }`}
    >
      {isDraggable && (
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing hover:text-border-gold mr-2 text-text-muted outline-none"
        >
          <GripVertical size={20} />
        </div>
      )}
      {!isDraggable && <div className="w-4 mr-1"></div>}
      
      <div 
        className="flex items-center space-x-3 flex-1 cursor-pointer"
        onClick={() => toggleTask(task)}
      >
        {task.completed ? (
          <CheckSquare className="text-accent-green min-w-[20px]" size={20} />
        ) : (
          <Square className="text-border-gold opacity-80 min-w-[20px]" size={20} />
        )}
        <div className={`text-base flex-1 ${task.completed ? 'line-through text-text-muted opacity-70' : 'text-text-parchment'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className={`inline-block px-2 py-0.5 text-[10px] font-pixel uppercase border rounded-sm mb-1 sm:mb-0 sm:mr-2 whitespace-nowrap ${catStyle} ${task.completed ? 'opacity-50 grayscale' : ''}`}>
              {cat}
            </span>
            <div className="markdown-body inline-markdown text-sm flex-1">
              <Markdown>{task.title}</Markdown>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
        className="text-text-muted hover:text-accent-red p-2 transition-colors ml-2"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default function Tasks() {
  const { user } = useAuth();
  const { trackEvent } = useAchievements();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('Geral');
  const [activeCategory, setActiveCategory] = useState<TaskCategory | 'Todas'>('Todas');
  const [isMemoriesOpen, setIsMemoriesOpen] = useState(false);
  const [memorySearch, setMemorySearch] = useState('');

  const filteredMemories = memories.filter(mem => 
    mem.title.toLowerCase().includes(memorySearch.toLowerCase()) || 
    mem.content.toLowerCase().includes(memorySearch.toLowerCase())
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setMemories([]);
      setLoadingTasks(false);
      return;
    }

    const qTasks = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      const tasksData: Task[] = [];
      snapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() } as Task);
      });
      // Sort primarily by order, then by createdAt descending
      tasksData.sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 0;
        const orderB = b.order !== undefined ? b.order : 0;
        if (orderA !== orderB) return orderA - orderB;
        return b.createdAt - a.createdAt;
      });
      setTasks(tasksData);
      setLoadingTasks(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
      setLoadingTasks(false);
    });

    const qMemories = query(collection(db, 'memories'), where('userId', '==', user.uid));
    const unsubscribeMemories = onSnapshot(qMemories, (snapshot) => {
      const memsData: Memory[] = [];
      snapshot.forEach((doc) => {
        memsData.push({ id: doc.id, ...doc.data() } as Memory);
      });
      memsData.sort((a, b) => b.createdAt - a.createdAt);
      setMemories(memsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'memories');
    });

    return () => {
      unsubscribeTasks();
      unsubscribeMemories();
    };
  }, [user]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;

    try {
      const minOrder = tasks.length > 0 ? Math.min(...tasks.map(t => t.order !== undefined ? t.order : 0)) : 0;
      await addDoc(collection(db, 'tasks'), {
        userId: user.uid,
        title: newTask.trim(),
        completed: false,
        createdAt: Date.now(),
        order: minOrder - 1,
        category: newTaskCategory
      });
      setNewTask('');
      trackEvent('tasksAdded');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const toggleTask = async (task: Task) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: !task.completed,
      });
      if (!task.completed) {
        trackEvent('tasksCompleted');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${task.id}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      trackEvent('tasksDeleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${taskId}`);
    }
  };

  const deleteMemory = async (memoryId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'memories', memoryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `memories/${memoryId}`);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !user) return;

    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);

    const newTasks = arrayMove(tasks, oldIndex, newIndex);
    
    // Otimistic local update
    setTasks(newTasks);

    try {
      const batch = writeBatch(db);
      let hasUpdates = false;

      // Iterate and only touch documents whose new order (index) differs from their current state
      newTasks.forEach((task, index) => {
        if (task.order !== index) {
          const taskRef = doc(db, 'tasks', task.id);
          batch.update(taskRef, { order: index });
          hasUpdates = true;
        }
      });

      if (hasUpdates) {
        await batch.commit();
      }
    } catch (error) {
      console.error("Batch update error:", error);
      handleFirestoreError(error, OperationType.UPDATE, 'tasks');
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <div className="bg-[rgba(0,0,0,0.5)] border-4 border-border-dark p-8 mt-10">
          <ListTodo className="mx-auto text-border-gold mb-4" size={48} />
          <h2 className="text-3xl text-border-gold mb-4">Anotações do Guardião</h2>
          <p className="text-xl text-text-parchment">
            Você precisa se conectar ao Além-Túmulo (Login) para acessar suas anotações.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-2 md:p-4">
      <div className="flex items-center space-x-3 mb-6 border-b border-border-dark pb-3">
        <ListTodo className="text-border-gold" size={28} />
        <h2 className="text-2xl font-pixel text-border-gold drop-shadow-sm uppercase">
          Anotações do Guardião
        </h2>
      </div>

      <div className="bg-[rgba(0,0,0,0.3)] border border-border-dark p-4 md:p-6 mb-8 rounded-sm">
        <form onSubmit={addTask} className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 mb-6">
          <select 
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
            className="bg-[rgba(0,0,0,0.6)] border border-border-dark px-3 py-3 text-text-muted focus:outline-none focus:border-border-gold text-sm font-pixel items-center"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Ex: Fazer 5 pregos complexos..."
            className="flex-1 bg-[rgba(0,0,0,0.6)] border border-border-dark px-4 py-3 text-text-parchment placeholder-[rgba(217,201,160,0.4)] focus:outline-none focus:border-border-gold text-base"
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="bg-panel-bg border border-border-gold text-border-gold px-6 py-3 hover:bg-[rgba(139,107,50,0.3)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
          >
            <Plus size={20} className="mr-2" />
            <span className="font-pixel text-xs mt-1">ADICIONAR</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-[rgba(58,38,24,0.4)]">
          <button
            onClick={() => setActiveCategory('Todas')}
            className={`px-3 py-1.5 text-xs font-pixel uppercase border rounded-sm transition-colors ${
              activeCategory === 'Todas' ? 'bg-border-gold/20 border-border-gold text-border-gold' : 'border-border-dark text-text-muted hover:text-text-parchment'
            }`}
          >
            Todas
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-pixel uppercase border rounded-sm transition-colors opacity-80 hover:opacity-100 ${
                activeCategory === cat ? categoryColors[cat].replace('/20', '/40') : 'border-border-dark text-text-muted hover:border-[rgba(166,124,61,0.5)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-2">
            {loadingTasks ? (
              <div className="grid grid-cols-1 gap-2">
                <SkeletonTaskCard />
                <SkeletonTaskCard />
                <SkeletonTaskCard />
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-center text-text-muted text-sm italic py-4 font-pixel">Nenhuma tarefa no reino.</p>
            ) : (
              <SortableContext
                items={
                  (activeCategory === 'Todas' ? tasks : tasks.filter(t => (t.category || 'Geral') === activeCategory)).map(t => t.id)
                }
                strategy={verticalListSortingStrategy}
              >
                {(activeCategory === 'Todas' ? tasks : tasks.filter(t => (t.category || 'Geral') === activeCategory)).map((task) => (
                  <SortableTaskItem 
                    key={task.id} 
                    task={task} 
                    toggleTask={toggleTask} 
                    deleteTask={deleteTask}
                    isDraggable={activeCategory === 'Todas'}
                  />
                ))}
              </SortableContext>
            )}
          </div>
        </DndContext>
      </div>

      <div className="mt-8 border border-[rgba(58,38,24,0.8)] rounded-sm bg-[rgba(15,12,10,0.6)] overflow-hidden">
        <button
          onClick={() => setIsMemoriesOpen(!isMemoriesOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-[rgba(26,22,20,0.8)] transition-colors group"
        >
          <div className="flex items-center space-x-3">
            <Archive className="text-text-muted group-hover:text-border-gold transition-colors" size={24} />
            <h2 className="text-xl font-pixel text-text-muted group-hover:text-border-gold drop-shadow-sm uppercase transition-colors">
              Arquivos do Cemitério ({memories.length})
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-pixel uppercase tracking-widest text-accent-green opacity-70 hidden md:block">
              Salvos pela IA
            </span>
            {isMemoriesOpen ? (
              <ChevronDown className="text-text-muted group-hover:text-border-gold" />
            ) : (
              <ChevronRight className="text-text-muted group-hover:text-border-gold" />
            )}
          </div>
        </button>

        {isMemoriesOpen && (
          <div className="p-4 border-t border-[rgba(58,38,24,0.8)] bg-[rgba(10,8,6,0.4)]">
            <div className="flex items-center bg-[rgba(0,0,0,0.6)] border border-[rgba(58,38,24,0.8)] px-3 py-2 text-text-parchment rounded-sm mb-6 focus-within:border-border-gold transition-colors">
              <Search size={18} className="text-text-muted mr-3" />
              <input
                type="text"
                placeholder="Buscar nos tomos antigos..."
                value={memorySearch}
                onChange={(e) => setMemorySearch(e.target.value)}
                className="flex-1 bg-transparent border-none focus:outline-none text-sm md:text-base placeholder-[rgba(217,201,160,0.3)]"
              />
            </div>

            {memories.length === 0 ? (
              <p className="text-center text-text-muted text-sm italic font-pixel py-6">
                As estantes estão vazias. Nenhuma sabedoria foi selada ainda.
              </p>
            ) : filteredMemories.length === 0 ? (
              <p className="text-center text-text-muted text-sm italic font-pixel py-6">
                Nenhum registro encontrado para esta busca.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {filteredMemories.map((mem) => (
                  <div key={mem.id} className="bg-[rgba(12,10,8,0.8)] border border-[rgba(80,80,90,0.4)] p-5 relative group transition-colors hover:border-[rgba(120,120,130,0.6)] shadow-inner">
                    <button
                      onClick={() => deleteMemory(mem.id)}
                      className="absolute top-3 right-3 text-text-muted hover:text-accent-red transition-colors opacity-0 group-hover:opacity-100"
                      title="Apagar Registro"
                    >
                      <Trash2 size={18} />
                    </button>
                    <h3 className="text-lg font-pixel tracking-wide text-[rgba(180,180,190,1)] mb-3 pr-8 border-b border-[rgba(80,80,90,0.4)] pb-2 flex items-center">
                      <Lock size={16} className="mr-3 text-[rgba(100,100,110,0.8)]" />
                      {mem.title}
                    </h3>
                    <div className="text-sm text-text-muted markdown-body inline-markdown leading-relaxed">
                      <Markdown>{mem.content}</Markdown>
                    </div>
                    <div className="mt-4 text-xs font-pixel tracking-widest text-[rgba(100,100,110,0.8)] uppercase flex items-center justify-between">
                      <span>Selado em: {new Date(mem.createdAt).toLocaleDateString()}</span>
                      <span className="text-accent-green opacity-50">IA</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
