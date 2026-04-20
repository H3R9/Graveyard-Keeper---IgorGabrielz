# ⚰️ Keeper OS v2.0

> **Companion app de segunda tela para Graveyard Keeper** — gerenciamento de tarefas, IA multimodal, base de conhecimento e persistência em nuvem, tudo em uma SPA responsiva.

![TypeScript](https://img.shields.io/badge/TypeScript-95%25-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-v12-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-v6-646CFF?style=flat-square&logo=vite&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_API-1.29-8E44AD?style=flat-square&logo=google&logoColor=white)

---

## 📖 Sobre o projeto

O **Keeper OS** nasceu para resolver o maior problema de jogadores de Graveyard Keeper: o atrito cognitivo de gerenciar simultaneamente cadeias de crafting, agendas de NPCs, árvores de tecnologia e requisições de quests — tudo isso enquanto o jogo está rodando ao lado.

A versão 2.0 foi totalmente refatorada com foco em arquitetura limpa, separação sólida de responsabilidades, e integração profunda com banco de dados em nuvem e IA multimodal em tempo real.

---

## ✨ Funcionalidades

### 🧠 Córtex do Zelador (AIChat)
- **Persona engessada** — a IA nunca chuta mecânicas que não conhece, priorizando Google Search Grounding para questões obscuras
- **Multimodalidade e OCR** — cole screenshots via `Ctrl+V` ou anexe imagens; a IA lê requisições de NPCs, menus e diálogos diretamente
- **Action Parsing XML** — detecta blocos `<tarefas>` e `<memorias>` na resposta e faz `addDoc` automático no Firestore sem intervenção do usuário
- **Google Search Grounding** — acessa a wiki do Graveyard Keeper em tempo real para perguntas super específicas

### 📝 Bloco de Notas (Tasks)
- **To-do list** alimentada manual ou automaticamente pelo AIChat via XML parsing
- **Drag-and-drop** para reordenar tarefas com `@dnd-kit`, sincronizado via batch update no Firestore
- **Categorias** — Craft, NPC, Exploração, Igreja, Masmorra — filtráveis por pills no topo
- **Memórias Permanentes** — informações vitais salvas pela IA ficam imutáveis em seção separada com tag "Salvo pela IA"
- **Sync em tempo real** via `onSnapshot` listeners — sem refresh, sem perda de dados

### 📚 Knowledge Base
| Módulo | Descrição |
|---|---|
| `Calendar.tsx` | Rastreador do calendário astrológico com rotação de NPCs e dias especiais (Farol, Igreja, Taverna) |
| `Characters.tsx` | Progressão histórica de quests por NPC — Inquisidor, Mercador, Astrológo e outros |
| `TechTree.tsx` | Árvore de tecnologias com checkboxes de progresso persistidos por usuário |
| `Alchemy.tsx` | Combinações de reagentes — Pós, Extratos, Soluções |
| `Cooking.tsx` | Consumíveis e otimizadores de Stamina |

### 🔐 Autenticação e Persistência
- **Login do Guardião** via Firebase Auth
- **Firestore** com regras de segurança robustas — validação de schema, limite de 200 chars, userId verificado no path
- **Chat sessions** persistidas com histórico paginado

---

## 🏗️ Arquitetura

```
src/
├── App.tsx                  # Root: layout mestre, activeTab state, Framer Motion transitions
├── Sidebar.tsx              # Navegação responsiva: bottom bar (mobile) / bento grid (desktop)
├── components/
│   ├── AIChat.tsx           # Córtex do Zelador — Gemini API, OCR, XML parsing, Firestore writes
│   ├── Tasks.tsx            # CRUD completo — Firestore onSnapshot, dnd-kit, categorias
│   ├── Calendar.tsx         # Calendário astrológico com estado do jogador
│   ├── Characters.tsx       # Progressão de NPCs via gameData.ts
│   ├── TechTree.tsx         # Árvore de tecnologias com progresso do usuário
│   ├── Alchemy.tsx          # Sistema de reagentes
│   └── Cooking.tsx          # Sistema de consumíveis
├── contexts/
│   └── AuthContext.tsx      # Firebase Auth context
├── lib/
│   ├── firebase.ts          # Inicialização do Firebase
│   └── gemini.ts            # Cliente Gemini API + system instructions
└── data/
    └── gameData.ts          # Fonte de verdade estática dos dados do jogo
```

### Fluxo de dados principal

```
Usuário → AIChat → Gemini API (streaming)
                       ↓
              Resposta com XML embutido
                       ↓
              XML Parser (DOMParser + fallback regex)
                       ↓
         Firestore addDoc → onSnapshot → Tasks.tsx re-render
```

---

## 🛠️ Tech Stack

| Categoria | Tecnologia | Versão |
|---|---|---|
| Framework | React | 19 |
| Linguagem | TypeScript | ~5.8 |
| Build | Vite | 6 |
| Estilização | Tailwind CSS | 4 |
| IA | Google GenAI SDK (Gemini) | 1.29 |
| Auth + DB | Firebase (Auth + Firestore) | 12 |
| Animações | Motion (Framer Motion) | 12 |
| Drag & Drop | @dnd-kit | 6/10 |
| Busca fuzzy | Fuse.js | 7 |
| Ícones | Lucide React | 0.546 |
| Markdown | react-markdown | 10 |
| Utils CSS | tailwind-merge + clsx | latest |

---

## 🚀 Rodando localmente

### Pré-requisitos

- Node.js 20+
- Conta no [Google AI Studio](https://aistudio.google.com) para a Gemini API key
- Projeto no [Firebase Console](https://console.firebase.google.com) com Auth e Firestore habilitados

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/H3R9/Graveyard-Keeper---IgorGabrielz.git
cd Graveyard-Keeper---IgorGabrielz

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves

# 4. Rode em desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:3000`.

### Variáveis de ambiente

```env
# .env.local

# Gemini API Key — obtenha em https://aistudio.google.com/apikey
GEMINI_API_KEY=sua_chave_aqui

# Firebase — copie do Console do Firebase > Configurações do projeto
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## 🗄️ Estrutura do Firestore

```
/users/{userId}/
  tasks/{taskId}
    - title: string (máx 200 chars)
    - completed: boolean
    - category: 'Craft' | 'NPC' | 'Exploração' | 'Igreja' | 'Masmorra'
    - order: number
    - createdAt: timestamp
    - userId: string

  memories/{memoryId}
    - title: string (máx 200 chars)
    - content: string (máx 5000 chars)
    - createdAt: timestamp
    - userId: string

  gameState/{stateId}
    - currentDay: number
    - updatedAt: timestamp
    - [outros campos do estado do jogo]

  achievements/{docId}
    - [mapa de conquistas desbloqueadas]

/chatSessions/{sessionId}
  - userId: string
  - createdAt: timestamp
  messages/{messageId}          ← append-only
    - role: 'user' | 'model'
    - content: string
    - timestamp: timestamp

/errorLogs/{logId}              ← write-only, sem leitura pelo cliente
  - userId: string
  - message: string
  - stack: string
  - timestamp: timestamp
```

---

## 🔒 Segurança

O `firestore.rules` implementa defesa em profundidade:

- **Ownership verificado no path** — `request.auth.uid == userId` em todas as subcoleções
- **Schema validation** em todas as operações de escrita — campos obrigatórios, tipos, limites de tamanho
- **`userId` imutável** — não pode ser alterado após criação via `uidNotModified()`
- **Chat messages append-only** — update e delete desabilitados nas mensagens
- **Error logs write-only** — o cliente nunca lê logs de erro (só escreve)
- **`userTechs` e `userSettings`** — delete desabilitado para dados críticos do jogador

---

## 📜 Scripts disponíveis

```bash
npm run dev      # Servidor de desenvolvimento (porta 3000)
npm run build    # Build de produção
npm run preview  # Preview do build local
npm run lint     # Type check com TypeScript (sem emissão)
npm run clean    # Limpa a pasta dist
```

---

## 🎮 Como usar

1. **Faça login** com sua conta Google via "Login do Guardião"
2. **Abra o AIChat** e descreva sua situação atual no jogo — ou cole uma screenshot diretamente
3. A IA cria tarefas automaticamente no **Bloco de Notas** via XML parsing
4. Consulte o **Calendário** para saber qual NPC estará disponível no próximo dia
5. Use o **TechTree** para marcar tecnologias já desbloqueadas e ver o que falta
6. Pesquise receitas em **Alchemy** e **Cooking** sem gastar tokens da IA

---

## 📁 Outros arquivos importantes

| Arquivo | Descrição |
|---|---|
| `firestore.rules` | Regras de segurança completas do Firestore com validação de schema |
| `firebase-blueprint.json` | Blueprint de configuração do projeto Firebase |
| `firebase-applet-config.json` | Configuração do applet Firebase para deploy |
| `.env.example` | Template das variáveis de ambiente necessárias |

---

## 🤝 Contribuindo

Este é um projeto pessoal de companion app. Se você encontrar bugs ou tiver sugestões:

1. Abra uma **Issue** descrevendo o problema
2. Fork o repositório e crie uma branch: `git checkout -b fix/nome-do-fix`
3. Commit suas mudanças: `git commit -m 'fix: descrição curta'`
4. Abra um **Pull Request**

---

## ⚠️ Aviso

Este projeto é um **fan-made companion app** sem afiliação com a Lazy Bear Games (desenvolvedora do Graveyard Keeper). Graveyard Keeper é propriedade da Lazy Bear Games.

---

<p align="center">
  Forjado nas profundezas do cemitério por <a href="https://github.com/H3R9">H3R9</a> 🪦
</p>
