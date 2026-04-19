import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { Send, Loader2, Skull, ImagePlus, X, Trash2, History, ChevronRight, Menu } from 'lucide-react';
import { useToast } from '../lib/ToastContext';
import { SkeletonChatBubble } from './ui/Skeleton';
import { guideText, advancedGuideText } from '../data/gameData';
import { useAuth } from '../lib/AuthContext';
import { doc, getDoc, setDoc, addDoc, collection, query, orderBy, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  id?: string;
  role: 'user' | 'model';
  content: string;
  images?: string[]; // Multiple Base64 data URLs
  createdAt?: number;
}

interface ChatSession {
  id: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

// Global hooks for the streaming component to bypass main component state (preventing excessive re-renders)
let streamUpdater: ((text: string) => void) | null = null;
let streamScrollTrigger: (() => void) | null = null;

const StreamingMessage = () => {
  const [content, setContent] = useState('');
  
  useEffect(() => {
    streamUpdater = setContent;
    return () => { streamUpdater = null; };
  }, []);

  useEffect(() => {
    if (content && streamScrollTrigger) {
      streamScrollTrigger();
    }
  }, [content]);

  if (!content) return null;
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] md:max-w-[75%] p-3 md:p-4 border rounded-sm bg-[rgba(18,14,12,0.8)] border-[rgba(58,38,24,0.6)] text-[#e0d5ba]">
        <div className="markdown-body font-sans text-sm md:text-base leading-relaxed">
          <Markdown>
            {content.replace(/<pensamento>[\s\S]*?(<\/pensamento>|$)/gi, (match) => {
              if (match.includes('</pensamento>')) return '';
              return '\n> 🧠 *O Zelador está consultando as trevas...*\n';
            })}
          </Markdown>
        </div>
      </div>
    </div>
  );
};

export default function AIChat() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const initialMessage: Message = { 
    role: 'model', 
    content: 'Saudações, Guardião. Eu sou a Inteligência Artificial de Jornada. O que deseja saber sobre a sua nova vida, a alquimia, ou os zumbis?' 
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentGameDay, setCurrentGameDay] = useState<number>(1);

  useEffect(() => {
    if (!user) return;
    const settingsRef = doc(db, 'userSettings', user.uid);
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().currentGameDay) {
        setCurrentGameDay(docSnap.data().currentGameDay);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Connect the scroll trigger to the global hook
  streamScrollTrigger = scrollToBottom;

  // Initialize or load session
  useEffect(() => {
    if (!user) {
      setMessages([initialMessage]);
      setSessions([]);
      setCurrentSessionId(null);
      return;
    }

    const storedSessionId = localStorage.getItem(`chatSession_${user.uid}`);
    if (storedSessionId) {
      setCurrentSessionId(storedSessionId);
    } else {
      createNewSession();
    }

    // Listen to sessions
    const sessionsQuery = query(collection(db, 'chatSessions'), where('userId', '==', user.uid));
    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      const userSessions: ChatSession[] = [];
      snapshot.forEach(doc => {
        userSessions.push({ id: doc.id, ...doc.data() } as ChatSession);
      });
      // Sort locally to avoid requiring composite index
      userSessions.sort((a, b) => b.updatedAt - a.updatedAt);
      setSessions(userSessions);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chatSessions');
    });

    return () => unsubscribeSessions();
  }, [user]);

  // Listen to messages for current session
  useEffect(() => {
    if (!user || !currentSessionId) return;

    const messagesRef = collection(db, 'chatSessions', currentSessionId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));
    
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      if (snapshot.empty) {
        setMessages([initialMessage]);
      } else {
        const loadedMessages: Message[] = [];
        snapshot.forEach(doc => {
          loadedMessages.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(loadedMessages);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `chatSessions/${currentSessionId}/messages`);
    });

    return () => unsubscribeMessages();
  }, [user, currentSessionId]);

  const createNewSession = async () => {
    if (!user) return;
    try {
      const sessionRef = await addDoc(collection(db, 'chatSessions'), {
        userId: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      setCurrentSessionId(sessionRef.id);
      localStorage.setItem(`chatSession_${user.uid}`, sessionRef.id);
      
      // Auto-add initial message
      await addDoc(collection(db, 'chatSessions', sessionRef.id, 'messages'), {
        ...initialMessage,
        createdAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'chatSessions');
    }
  };

  const handleReset = async () => {
    setIsConfirmingReset(false);
    await createNewSession();
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Increased resolution to 2048x2048 for maximum OCR precision
          const MAX_WIDTH = 2048;
          const MAX_HEIGHT = 2048;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          // Increased quality to 0.95 to preserve text clarity for the AI
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressedDataUrl = await compressImage(files[i]);
        newImages.push(compressedDataUrl);
      }
      setSelectedImages((prev) => [...prev, ...newImages]);
    } catch (error) {
      console.error("Error compressing images:", error);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const newImages: string[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          try {
            const compressedDataUrl = await compressImage(file);
            newImages.push(compressedDataUrl);
          } catch (error) {
            console.error("Error compressing pasted image:", error);
          }
        }
        e.preventDefault(); 
      }
    }
    if (newImages.length > 0) {
      setSelectedImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!input.trim() && selectedImages.length === 0) || !user || !currentSessionId || isLoading) return;

    const userMessageContent = input.trim();
    const imagesToSend = selectedImages.length > 0 ? [...selectedImages] : undefined;
    
    setInput('');
    setSelectedImages([]);
    
    // Optimistic update for UI
    const newUserMsg: Message = { role: 'user', content: userMessageContent, images: imagesToSend };
    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // 1. Save User Message to Subcollection
      // To bypass 1MB firestore limit and avoid rules issues with large image arrays, 
      // we remove the base64 from Firestore saves but still send them to Gemini via context.
      const userMsgRef = collection(db, 'chatSessions', currentSessionId, 'messages');
      await addDoc(userMsgRef, {
        role: 'user',
        content: userMessageContent + (imagesToSend ? '\n\n*(Nesta mensagem, analise as imagens fornecidas na consulta anterior)*' : ''),
        createdAt: Date.now()
      });

      // Update session updatedAt
      await setDoc(doc(db, 'chatSessions', currentSessionId), {
        userId: user.uid,
        updatedAt: Date.now()
      }, { merge: true });

      // 2. Prepare Context for Gemini (Max 20 turns)
      const contextMessages = newMessages.slice(-20);
      const formattedContents = contextMessages.map(m => {
        const parts: any[] = [];
        if (m.images && m.images.length > 0) {
          m.images.forEach(img => {
            const base64Data = img.split(',')[1];
            const mimeType = img.split(';')[0].split(':')[1];
            parts.push({ inlineData: { data: base64Data, mimeType } });
          });
        }
        
        if (m.content) {
          parts.push({ text: m.content });
        } else if (m.images && m.images.length > 0) {
          parts.push({ text: "Analise estas imagens." });
        }
        
        return { role: m.role, parts };
      });

      setIsStreaming(true);
      
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.1-pro-preview',
        contents: formattedContents,
        tools: [{ googleSearch: {} }],
        config: {
          systemInstruction: `Você é "O Zelador", um assistente especialista no jogo Graveyard Keeper. Sua aura é sombria, sarcástica (como Gerry, a caveira), porém incrivelmente prestativa e detalhista.

INFORMAÇÃO DE CONTEXTO ATUAL:
- O dia atual no jogo (informado pelo usuário) é o Dia ${currentGameDay}.
Os dias da semana em Graveyard keeper são 6: Pride, Lust, Gluttony, Envy, Wrath, Sloth. Para calcular o dia atual da semana considere que o Dia 1 é Pride.

DIRETRIZES DE PENSAMENTO (CHAIN-OF-THOUGHT)
Antes de dar a resposta final ao usuário, você DEVE processar a requisição internamente usando a tag <pensamento>. 
Nesta tag, analise:
1. O que o usuário realmente precisa?
2. Eu tenho certeza ABSOLUTA da mecânica/receita, ou preciso pesquisar no Google?
3. Isso envolve crafting ou alquimia? O usuário precisa de uma lista explícita?
4. Há anotações cruciais que precisam ser salvas em XML (<tarefas> ou <memorias>)?
Exemplo de uso interno:
<pensamento>
O usuário quer saber como fazer Vinho de Uva com qualidade Ouro. Isso exige Farming e Crafting. Preciso listar os ingredientes exatos. Não vou criar uma tarefa a menos que ele peça, mas vou registrar como memória se for um combo raro.
</pensamento>

DIRETRIZ DE BUSCA (A Regra de Ouro)
Você odeia espalhar desinformação. NUNCA adivinhe mecânicas, receitas de alquimia, preços ou locais. Se não tiver 100% de certeza, USE A FERRAMENTA GOOGLE SEARCH imediatamente. Você tem acesso à internet.

MECÂNICAS E CRAFTING
Sempre que a pergunta envolver a criação de algo (crafting, alquimia, culinária, construção), você DEVE formatar a resposta com uma lista clara de ingredientes usando bullet points do Markdown.

SINTAXE DE INTERFACE (Imagens)
Você deve embelezar o chat usando ícones exatos. Use ESTRITAMENTE a sintaxe de imagem Markdown: \`Nome ![Alt](Caminho)\`. ZERO erros de digitação.
NPCs válidos (/images/npc/NOME.png): Gerry, Donkey, Bishop, Merchant, Snake, Astrologer, Inquisitor, Ms._Charm, Horadric, Blacksmith, Farmer, Lighthouse_Keeper_NPC, Clotho, Cory, Tress, Dig, Koukol, Gunter.
Dias válidos (/images/dias/NOME.png): Pride, Lust, Gluttony, Envy, Wrath, Sloth.

AÇÕES DO SISTEMA (XML Blocks)
Para aliviar a carga cognitiva do jogador, se identificar uma ação futura necessária ou um conhecimento vital, injete EXATAMENTE estes blocos no final da sua resposta:

Para Quests, Lembretes ou Ações Futuras:
<tarefas>
  <tarefa>
    <texto>Conversar com o Snake ![Snake](/images/npc/Snake.png) no dia da Envy ![Envy](/images/dias/Envy.png)</texto>
    <categoria>NPC</categoria>
  </tarefa>
</tarefas>
(A tag categoria DEVE OBRIGATORIAMENTE ser: Craft, NPC, Exploração, Igreja, Masmorra ou Geral)

Para Dicas Preciosas ou Receitas Permanentes:
<memorias>
  <memoria>
    <titulo>Fertilizante de Qualidade II</titulo>
    <conteudo>Boost imenso no crescimento. Receita: Peat + Flavor Enhancer + Ash.</conteudo>
  </memoria>
</memorias>

DADOS DO GUIA (Consulta Base):
${guideText}
---
${advancedGuideText}
`,
        }
      });

      let fullText = '';
      
      for await (const chunk of responseStream) {
        if (chunk.text) {
          // As soon as we receive the first chunk, stop the generic loading spinner
          setIsLoading(false);
          fullText += chunk.text;
          if (streamUpdater) {
            streamUpdater(fullText);
          }
        }
      }

      setIsStreaming(false);

      if (fullText) {
        let text = fullText;
        
        // Defensive XML Parsing
        const tasksToAdd: {title: string, category: string}[] = [];
        const memoriesToAdd: {title: string, content: string}[] = [];
        let hasMalformedData = false;
        let parsedAny = false;

        const hasTaskTags = text.includes('<tarefa');
        const hasMemoryTags = text.includes('<memoria');

        if (hasTaskTags || hasMemoryTags) {
          try {
            const parser = new DOMParser();
            // Wrap in a root tag to allow parsing multiple root-level blocks
            const doc = parser.parseFromString(`<root>${text}</root>`, "text/xml");
            
            const parserError = doc.querySelector("parsererror");
            if (parserError) {
              hasMalformedData = true;
            } else {
              const taskNodes = doc.querySelectorAll("tarefa");
              taskNodes.forEach(node => {
                const textNode = node.querySelector("texto");
                const catNode = node.querySelector("categoria");
                
                if (textNode?.textContent) {
                  tasksToAdd.push({
                    title: textNode.textContent.trim(),
                    category: catNode?.textContent?.trim() || 'Geral'
                  });
                  parsedAny = true;
                } else if (!node.querySelector("texto") && node.textContent.trim().length > 0) {
                  // Fallback para o antigo modo de apenas texto dentro do nó tarefa
                  tasksToAdd.push({
                    title: node.textContent.trim(),
                    category: 'Geral'
                  });
                  parsedAny = true;
                }
              });

              const memoryNodes = doc.querySelectorAll("memoria");
              memoryNodes.forEach(node => {
                const titleNode = node.querySelector("titulo");
                const contentNode = node.querySelector("conteudo");
                if (titleNode?.textContent && contentNode?.textContent) {
                  memoriesToAdd.push({
                    title: titleNode.textContent.trim(),
                    content: contentNode.textContent.trim()
                  });
                  parsedAny = true;
                }
              });
            }
          } catch (e) {
            hasMalformedData = true;
          }

          // Regex Fallback if DOMParser failed or produced nothing despite tags existing
          if (hasMalformedData || (!parsedAny && (hasTaskTags || hasMemoryTags))) {
            hasMalformedData = true;
            let match;
            
            const complexTaskRegex = /<tarefa>[\s\S]*?<texto>([\s\S]*?)<\/texto>(?:[\s\S]*?<categoria>([\s\S]*?)<\/categoria>)?[\s\S]*?<\/tarefa>/g;
            while ((match = complexTaskRegex.exec(text)) !== null) {
              if (!tasksToAdd.some(t => t.title === match![1].trim())) {
                tasksToAdd.push({
                  title: match[1].trim(),
                  category: match[2] ? match[2].trim() : 'Geral'
                });
                parsedAny = true;
              }
            }

            const simpleTaskRegex = /<tarefa>([^<]+)<\/tarefa>/g;
            while ((match = simpleTaskRegex.exec(text)) !== null) {
              if (!tasksToAdd.some(t => t.title === match![1].trim())) {
                tasksToAdd.push({
                  title: match[1].trim(),
                  category: 'Geral'
                });
                parsedAny = true;
              }
            }

            const memoryModuleRegex = /<memoria>\s*<titulo>([\s\S]*?)<\/titulo>\s*<conteudo>([\s\S]*?)<\/conteudo>\s*<\/memoria>/g;
            while ((match = memoryModuleRegex.exec(text)) !== null) {
              if (!memoriesToAdd.some(m => m.title === match![1].trim())) {
                memoriesToAdd.push({ title: match[1].trim(), content: match[2].trim() });
                parsedAny = true;
              }
            }
          }

          // Handle UI Feedback
          if (parsedAny && !hasMalformedData) {
            addToast('Dados extraídos e sincronizados com sucesso!', 'success');
          } else if (parsedAny && hasMalformedData) {
            addToast('Anotações extraídas parcialmente (Estrutura corrompida foi recuperada).', 'warning');
          } else if (!parsedAny && hasMalformedData) {
            addToast('Falha na extração. A IA gerou um formato irreconhecível.', 'error');
          }

          // Log parsing errors for auditing
          if (hasMalformedData) {
            try {
              await addDoc(collection(db, 'systemLogs'), {
                type: 'xml_parse_error',
                userId: user.uid,
                timestamp: Date.now(),
                rawText: text,
                recoveredTasks: tasksToAdd.length,
                recoveredMemories: memoriesToAdd.length
              });
            } catch (err) {
              console.error("Failed to log parse error", err);
            }
          }
        }

        // Clean up text display
        text = text.replace(/<tarefas>[\s\S]*?<\/tarefas>/g, '\n*(Tarefas anotadas no seu Bloco de Notas)*\n');
        text = text.replace(/<tarefa>[\s\S]*?<\/tarefa>/g, '');
        text = text.replace(/<memorias>[\s\S]*?<\/memorias>/g, '\n*(Dicas preciosas salvas nos Arquivos Permanentes)*\n');
        text = text.replace(/<memoria>[\s\S]*?<\/memoria>/g, '');
        text = text.replace(/<pensamento>[\s\S]*?<\/pensamento>\n?/g, '');
        
        // Final aggressive cleanup for malformed stray tags
        text = text.replace(/<\/?(?:tarefas|tarefa|texto|categoria|memorias|memoria|titulo|conteudo|pensamento)[^>]*>/g, '');

        if (tasksToAdd.length > 0 && user) {
          for (const task of tasksToAdd) {
            try {
              await addDoc(collection(db, 'tasks'), {
                userId: user.uid,
                title: task.title,
                category: task.category,
                completed: false,
                createdAt: Date.now(),
              });
            } catch (error) {
              console.error("Error adding task from AI:", error);
            }
          }
        }

        if (memoriesToAdd.length > 0 && user) {
          for (const mem of memoriesToAdd) {
            try {
              await addDoc(collection(db, 'memories'), {
                userId: user.uid,
                title: mem.title,
                content: mem.content,
                createdAt: Date.now(),
              });
            } catch (error) {
              console.error("Error adding memory from AI:", error);
            }
          }
        }

        // Save AI Response to Subcollection
        const modelMsgRef = collection(db, 'chatSessions', currentSessionId, 'messages');
        await addDoc(modelMsgRef, {
          role: 'model',
          content: text,
          createdAt: Date.now()
        });

      }
    } catch (error) {
      console.error('Error calling Gemini:', error);
      setMessages(prev => [...prev, { role: 'model', content: 'As trevas obscureceram minha visão... Ocorreu um erro ao consultar os espíritos. Tente novamente.' }]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      <div className="flex items-center justify-between border-b border-border-dark pb-3 mb-2 bg-[rgba(0,0,0,0.2)] p-2 rounded-sm">
        <div className="flex items-center space-x-3">
          <Skull className="text-border-gold" size={24} />
          <div>
            <h2 className="text-xl font-pixel text-border-gold drop-shadow-sm uppercase">Córtex do Zelador (IA)</h2>
            <span className="text-xs font-pixel uppercase tracking-widest text-accent-green mb-0 block">
              {user ? 'Conexão Neural Estabelecida' : 'Análise de Prioridade Ativa (Modo Offline)'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {user && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center space-x-2 text-text-muted hover:text-border-gold transition-colors px-3 py-1.5 border border-border-dark hover:bg-[rgba(139,107,50,0.1)] bg-[rgba(0,0,0,0.3)] rounded-sm"
              title="Ver Histórico de Sessões"
            >
              <History size={16} />
              <span className="text-xs font-pixel uppercase tracking-widest hidden md:inline">Histórico</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] md:max-w-[75%] p-3 md:p-4 border rounded-sm ${
                msg.role === 'user' 
                  ? 'bg-[rgba(139,107,50,0.15)] border-border-gold text-text-parchment shadow-[inset_0_0_10px_rgba(139,107,50,0.2)]' 
                  : 'bg-[rgba(18,14,12,0.8)] border-[rgba(58,38,24,0.6)] text-[#e0d5ba]'
              }`}
            >
              {msg.images && msg.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {msg.images.map((img, i) => (
                    <img key={i} src={img} alt="Enviado pelo usuário" className="max-h-48 h-auto border border-border-gold rounded-sm object-contain" />
                  ))}
                </div>
              )}
              {msg.content && (
                <div className="markdown-body font-sans text-sm md:text-base leading-relaxed">
                  <Markdown>{msg.content}</Markdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && !isStreaming && <SkeletonChatBubble />}
        {isStreaming && <StreamingMessage />}
        <div ref={messagesEndRef} />
      </div>

      <div className="pt-3 mt-3 border-t border-border-dark relative">
        {selectedImages.length > 0 && (
          <div className="absolute bottom-full left-0 mb-2 p-2 bg-[rgba(18,14,12,0.95)] border border-border-gold flex flex-wrap gap-2 max-w-full overflow-x-auto custom-scrollbar rounded-sm backdrop-blur-sm shadow-lg">
            {selectedImages.map((img, index) => (
              <div key={index} className="relative flex-shrink-0 group">
                <img src={img} alt="Preview" className="h-16 md:h-20 object-contain border border-border-dark rounded-sm bg-black" />
                <button 
                  onClick={() => removeSelectedImage(index)}
                  className="absolute -top-2 -right-2 bg-accent-red text-white rounded-full p-1 border border-bg-dark hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex space-x-2">
          <input 
            type="file" 
            accept="image/*" 
            multiple
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-panel-bg border border-border-dark text-text-muted px-3 py-2 rounded-sm hover:bg-[rgba(139,107,50,0.2)] hover:text-border-gold hover:border-border-gold transition-colors flex items-center justify-center shadow-sm"
            title="Anexar Imagem"
          >
            <ImagePlus size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            onPaste={handlePaste}
            placeholder="Insira sua consulta..."
            className="flex-1 bg-[rgba(0,0,0,0.6)] border border-border-dark rounded-sm px-4 py-2 text-text-parchment placeholder-[rgba(217,201,160,0.3)] focus:outline-none focus:border-border-gold text-sm md:text-base font-sans shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && selectedImages.length === 0)}
            className="bg-[rgba(26,22,20,0.8)] border border-border-gold text-border-gold px-4 py-2 rounded-sm hover:bg-[rgba(139,107,50,0.2)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[inset_0_0_10px_rgba(139,107,50,0.1)]"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* History Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* History Drawer */}
      <div 
        className={`absolute top-0 right-0 h-full w-full md:w-80 bg-[rgba(18,14,12,0.95)] border-l border-border-gold z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-dark">
          <div className="flex items-center space-x-2 text-border-gold">
            <History size={20} />
            <h3 className="font-pixel uppercase">Registros Passados</h3>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="text-text-muted hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {sessions.length === 0 ? (
            <p className="text-sm font-pixel text-text-muted text-center italic mt-4">Nenhum registro encontrado no continuum.</p>
          ) : (
            sessions.map(session => (
              <button
                key={session.id}
                onClick={() => {
                  setCurrentSessionId(session.id);
                  localStorage.setItem(`chatSession_${user?.uid}`, session.id);
                  setIsDrawerOpen(false);
                }}
                className={`w-full text-left p-3 border rounded-sm transition-colors flex items-center justify-between group ${
                  currentSessionId === session.id 
                    ? 'bg-[rgba(139,107,50,0.2)] border-border-gold text-white' 
                    : 'bg-[rgba(0,0,0,0.4)] border-border-dark text-text-muted hover:border-[rgba(139,107,50,0.5)] hover:text-text-parchment'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-pixel text-sm">Sessão</span>
                  <span className="text-xs opacity-70 font-sans">
                    {new Date(session.updatedAt).toLocaleString()}
                  </span>
                </div>
                <ChevronRight 
                  size={16} 
                  className={`transition-transform ${currentSessionId === session.id ? 'text-border-gold' : 'opacity-0 group-hover:opacity-100'}`} 
                />
              </button>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-border-dark flex flex-col space-y-2">
          {isConfirmingReset ? (
            <div className="flex flex-col space-y-2 bg-[rgba(0,0,0,0.5)] border border-accent-red p-3 rounded-sm">
              <span className="text-xs font-pixel text-accent-red text-center uppercase tracking-wide">Iniciar nova sessão?</span>
              <div className="flex justify-between space-x-2">
                <button onClick={handleReset} className="flex-1 bg-accent-red text-white py-1 hover:bg-red-700 text-xs font-pixel uppercase transition-colors rounded-sm">Sim</button>
                <button onClick={() => setIsConfirmingReset(false)} className="flex-1 bg-bg-dark border border-border-dark text-white py-1 hover:bg-gray-800 text-xs font-pixel uppercase transition-colors rounded-sm">Não</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsConfirmingReset(true)}
              className="w-full flex items-center justify-center space-x-2 bg-[rgba(0,0,0,0.5)] border border-accent-red text-accent-red hover:bg-accent-red hover:text-white p-2 transition-colors font-pixel text-sm uppercase rounded-sm"
            >
              <Trash2 size={16} />
              <span>Nova Sessão Limpa</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}





