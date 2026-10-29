import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquarePlus,
  ThumbsUp,
  Heart,
  Send,
  Sparkles,
  CheckCircle2,
  Filter,
  Search,
  Tag,
  Laptop,
  Smartphone,
  Tablet,
  Lightbulb,
  Clock,
  Compass,
  Check,
  Copy,
  Mail,
  Flame,
  UserCheck,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';

export interface UserSuggestion {
  id: string;
  author: string;
  title: string;
  content: string;
  category: 'features' | 'graphics' | 'physics' | 'interface' | 'other';
  priority: 'idea' | 'important' | 'fix';
  device: 'mobile' | 'desktop' | 'tablet';
  dateStr: string;
  votes: number;
  status: 'analyzing' | 'planned' | 'implemented' | 'popular';
  isUserCreated?: boolean;
}

// Lista limpa sem sugestões pré-criadas pelo sistema
const INITIAL_SUGGESTIONS: UserSuggestion[] = [];

const CATEGORY_LABELS: Record<UserSuggestion['category'], { label: string; color: string; icon: string }> = {
  features: { label: 'Novos Recursos & Astros', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', icon: '🔭' },
  graphics: { label: 'Gráficos 3D & Relevo', color: 'bg-sky-500/15 text-sky-300 border-sky-500/30', icon: '🌍' },
  physics: { label: 'Física Celeste & Órbitas', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30', icon: '⚙️' },
  interface: { label: 'Interface & Mobile', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30', icon: '📱' },
  other: { label: 'Outras Sugestões', color: 'bg-slate-500/15 text-slate-300 border-slate-500/30', icon: '💬' },
};

const STATUS_LABELS: Record<UserSuggestion['status'], { label: string; badgeColor: string }> = {
  analyzing: { label: 'Em Análise', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  planned: { label: 'Planejado', badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  popular: { label: 'Destaque da Comunidade', badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  implemented: { label: 'Implementado no App', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
};

export const FeedbackModal: React.FC = () => {
  const { activeTab, setActiveTab } = useSimulationStore();

  const [activeModalTab, setActiveModalTab] = useState<'feed' | 'new' | 'my'>('feed');
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');

  // Formulário de Nova Sugestão
  const [formAuthor, setFormAuthor] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<UserSuggestion['category']>('features');
  const [formPriority, setFormPriority] = useState<UserSuggestion['priority']>('idea');
  const [formDevice, setFormDevice] = useState<UserSuggestion['device']>('mobile');
  const [formEmail, setFormEmail] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Carregar sugestões salvas do LocalStorage (removendo qualquer sugestão fictícia do sistema)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sola_user_suggestions_v2');
      if (stored) {
        const parsed: UserSuggestion[] = JSON.parse(stored);
        // Filtra eliminando qualquer sugestão inicial de mock do sistema ('sug-')
        const userOnly = parsed.filter((s) => s.isUserCreated && !s.id.startsWith('sug-'));
        setSuggestions(userOnly);
        localStorage.setItem('sola_user_suggestions_v2', JSON.stringify(userOnly));
      } else {
        setSuggestions([]);
      }

      const storedVotes = localStorage.getItem('sola_voted_suggestion_ids');
      if (storedVotes) {
        setVotedIds(JSON.parse(storedVotes));
      }
    } catch (e) {
      setSuggestions([]);
    }
  }, []);

  // Salvar no LocalStorage sempre que alterar
  const saveSuggestions = (list: UserSuggestion[]) => {
    setSuggestions(list);
    try {
      localStorage.setItem('sola_user_suggestions_v2', JSON.stringify(list));
    } catch (e) {
      console.warn('Erro ao salvar no LocalStorage', e);
    }
  };

  const handleVote = (id: string) => {
    const hasVoted = votedIds.includes(id);
    let newVoted: string[];
    let diff = 1;

    if (hasVoted) {
      newVoted = votedIds.filter((vId) => vId !== id);
      diff = -1;
    } else {
      newVoted = [...votedIds, id];
      diff = 1;
    }

    setVotedIds(newVoted);
    localStorage.setItem('sola_voted_suggestion_ids', JSON.stringify(newVoted));

    const updated = suggestions.map((s) => {
      if (s.id === id) {
        return { ...s, votes: Math.max(0, s.votes + diff) };
      }
      return s;
    });

    saveSuggestions(updated);
  };

  const handleDeleteSuggestion = (id: string) => {
    const updated = suggestions.filter((s) => s.id !== id);
    saveSuggestions(updated);
    // Remove voto se existente
    if (votedIds.includes(id)) {
      const newVotes = votedIds.filter((vId) => vId !== id);
      setVotedIds(newVotes);
      localStorage.setItem('sola_voted_suggestion_ids', JSON.stringify(newVotes));
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Deseja realmente limpar todas as sugestões da lista?')) {
      saveSuggestions([]);
      setVotedIds([]);
      localStorage.removeItem('sola_voted_suggestion_ids');
    }
  };

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const newSuggestion: UserSuggestion = {
      id: `user-sug-${Date.now()}`,
      author: formAuthor.trim() || 'Usuário do Simulador',
      title: formTitle.trim(),
      content: formContent.trim(),
      category: formCategory,
      priority: formPriority,
      device: formDevice,
      dateStr: 'Agora mesmo',
      votes: 1, // Começa com o próprio voto do autor
      status: 'analyzing',
      isUserCreated: true,
    };

    const updated = [newSuggestion, ...suggestions];
    saveSuggestions(updated);

    // Adiciona o voto do criador
    const newVotes = [...votedIds, newSuggestion.id];
    setVotedIds(newVotes);
    localStorage.setItem('sola_voted_suggestion_ids', JSON.stringify(newVotes));

    // Resetar formulário
    setFormTitle('');
    setFormContent('');
    setFormEmail('');
    setSubmitSuccess(true);

    setTimeout(() => {
      setSubmitSuccess(false);
      setActiveModalTab('feed');
    }, 1800);
  };

  const handleCopyText = (suggestion: UserSuggestion) => {
    const text = `Sugestão para o SOLA 3D: "${suggestion.title}" - ${suggestion.content} (Autor: ${suggestion.author})`;
    navigator.clipboard.writeText(text);
    setCopiedId(suggestion.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (activeTab !== 'feedback') return null;

  // Filtragem e Ordenação
  const filteredSuggestions = suggestions.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedSuggestions = [...filteredSuggestions].sort((a, b) => {
    if (sortBy === 'votes') {
      return b.votes - a.votes;
    }
    return 0; // Ordem de inserção (mais recentes no topo)
  });

  const userCreatedList = suggestions.filter((s) => s.isUserCreated);

  return (
    <div
      id="modal-feedback-suggestions"
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl p-3 sm:p-6 lg:p-8 flex flex-col pointer-events-auto overflow-y-auto animate-in fade-in duration-300"
    >
      {/* Container Centralizado */}
      <div className="w-full max-w-5xl mx-auto flex flex-col flex-1 pb-10">
        {/* Header Superior */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <MessageSquarePlus className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  Mensagens & Sugestões de Usuários
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Melhorias Contínuas
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                Participe do desenvolvimento do simulador: envie suas ideias, aponte melhorias e vote nas sugestões mais interessantes da comunidade!
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('system')}
            title="Fechar e voltar ao mapa 3D (ou pressione ESC)"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700/80 hover:border-slate-600 transition shadow-lg active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Voltar ao Mapa 3D</span>
          </button>
        </div>

        {/* Barra de Abas Internas */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveModalTab('feed')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                activeModalTab === 'feed'
                  ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Sugestões da Comunidade</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-black/30 rounded-full font-mono">
                {suggestions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveModalTab('new')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                activeModalTab === 'new'
                  ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Enviar Minha Sugestão</span>
            </button>

            <button
              onClick={() => setActiveModalTab('my')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                activeModalTab === 'my'
                  ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Minhas Mensagens</span>
              {userCreatedList.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-sky-500/30 text-sky-200 rounded-full font-mono">
                  {userCreatedList.length}
                </span>
              )}
            </button>
          </div>

          {activeModalTab === 'feed' && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Ordenar:</span>
              <div className="flex items-center bg-slate-950 rounded-xl p-0.5 border border-slate-800 text-[11px]">
                <button
                  onClick={() => setSortBy('votes')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                    sortBy === 'votes'
                      ? 'bg-sky-600/30 text-sky-200 font-bold border border-sky-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Mais Votadas</span>
                </button>
                <button
                  onClick={() => setSortBy('recent')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                    sortBy === 'recent'
                      ? 'bg-sky-600/30 text-sky-200 font-bold border border-sky-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Recentes</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CONTEÚDO DA ABA 1: FEED DE SUGESTÕES */}
        {activeModalTab === 'feed' && (
          <div className="flex flex-col gap-5">
            {/* Filtros e Campo de Busca (Layout Aperfeiçoado e Responsivo) */}
            <div className="flex flex-col gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/90 shadow-lg">
              {/* Barra de Busca Proeminente */}
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
                <input
                  type="text"
                  placeholder="Pesquise por ideias, termos ou autores (ex: analema, horizonte, nuvens, órbita, raio laser)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-700/80 hover:border-slate-600 focus:border-sky-400 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400/30 transition shadow-inner"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition text-xs"
                    title="Limpar busca"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Categorias (Pills) com Scroll Suave */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Todas ({suggestions.length})
                </button>

                {(Object.keys(CATEGORY_LABELS) as UserSuggestion['category'][]).map((catKey) => {
                  const cat = CATEGORY_LABELS[catKey];
                  const count = suggestions.filter((s) => s.category === catKey).length;
                  const isSelected = selectedCategory === catKey;

                  return (
                    <button
                      key={catKey}
                      onClick={() => setSelectedCategory(catKey)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                        isSelected
                          ? `${cat.color} border`
                          : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                      <span className="text-[10px] opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Banner de Incentivo para Enviar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Tem uma ideia que ainda não está na lista?
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    O simulador é atualizado continuamente ouvindo a comunidade. Registre sua sugestão agora!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModalTab('new')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-600 to-cyan-500 hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-950 active:scale-95 transition cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Sugestão</span>
              </button>
            </div>

            {/* Grade de Mensagens/Sugestões */}
            {suggestions.length === 0 ? (
              <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800/90 flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500/10 via-cyan-500/10 to-indigo-500/10 border border-sky-400/25 flex items-center justify-center text-sky-400 mb-4 shadow-lg shadow-sky-950/40">
                  <Lightbulb className="w-8 h-8 text-sky-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
                  Nenhuma sugestão na lista
                </h3>
                <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                  O painel de sugestões está totalmente limpo e pronto para receber suas contribuições. Registre suas ideias, melhorias de física celeste, relevo 3D ou novos recursos para o simulador!
                </p>
                <button
                  onClick={() => setActiveModalTab('new')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-500 hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-950/60 active:scale-95 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Primeira Sugestão</span>
                </button>
              </div>
            ) : sortedSuggestions.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800">
                <p className="text-sm font-bold text-slate-300 mb-1">Nenhuma sugestão encontrada</p>
                <p className="text-xs text-slate-500">Tente buscar por outro termo ou selecione "Todas" as categorias.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedSuggestions.map((sug) => {
                  const isVoted = votedIds.includes(sug.id);
                  const cat = CATEGORY_LABELS[sug.category];
                  const stat = STATUS_LABELS[sug.status];

                  return (
                    <div
                      key={sug.id}
                      className={`relative p-5 rounded-2xl bg-slate-900/70 border transition flex flex-col justify-between ${
                        sug.isUserCreated
                          ? 'border-sky-500/50 shadow-lg shadow-sky-950/30 bg-slate-900/90'
                          : 'border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Top Meta info */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cat.color}`}>
                              {cat.icon} {cat.label}
                            </span>
                            {sug.isUserCreated && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500 text-slate-950">
                                Sua Sugestão
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stat.badgeColor}`}>
                              {stat.label}
                            </span>
                            {sug.isUserCreated && (
                              <button
                                onClick={() => handleDeleteSuggestion(sug.id)}
                                title="Excluir minha sugestão"
                                className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm sm:text-base font-bold text-white mb-2 leading-snug">
                          {sug.title}
                        </h3>

                        {/* Content */}
                        <p className="text-xs text-slate-300 leading-relaxed mb-4">
                          {sug.content}
                        </p>
                      </div>

                      {/* Footer com Autor, Dispositivo e Botão de Votar */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-sky-300">
                            {sug.author.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-300">{sug.author}</span>
                          <span>•</span>
                          <span className="text-slate-500 text-[10px]">{sug.dateStr}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyText(sug)}
                            title="Copiar texto da sugestão"
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                          >
                            {copiedId === sug.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Botão de Votar / Apoiar */}
                          <button
                            onClick={() => handleVote(sug.id)}
                            title={isVoted ? 'Você já apoiou esta ideia (clique para remover)' : 'Apoiar esta sugestão (+1 voto)'}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                              isVoted
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-950 border border-emerald-400/60'
                                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700'
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-white' : ''}`} />
                            <span>{sug.votes}</span>
                            <span className="text-[10px] hidden sm:inline">{isVoted ? 'Apoiado' : 'Apoiar'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CONTEÚDO DA ABA 2: FORMULÁRIO DE NOVA SUGESTÃO */}
        {activeModalTab === 'new' && (
          <div className="max-w-2xl mx-auto w-full bg-slate-900/80 p-5 sm:p-7 rounded-2xl border border-slate-800 shadow-xl">
            <div className="mb-6">
              <h3 className="text-base sm:text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-400" />
                <span>Formulário de Sugestão de Melhoria</span>
              </h3>
              <p className="text-xs text-slate-400">
                Compartilhe o que você gostaria de ver implementado, ajustado ou aperfeiçoado no app.
              </p>
            </div>

            {submitSuccess ? (
              <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-950">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">Sugestão Enviada com Sucesso!</h4>
                <p className="text-xs text-slate-300 max-w-sm mb-4">
                  Sua sugestão já foi registrada e adicionada à lista da comunidade para análise e votação.
                </p>
                <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                {/* Nome ou Apelido */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Seu Nome ou Apelido
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rafael, Astrônomo Curioso, Observador..."
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                  />
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Categoria da Sugestão
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(CATEGORY_LABELS) as UserSuggestion['category'][]).map((catKey) => {
                      const cat = CATEGORY_LABELS[catKey];
                      const isSelected = formCategory === catKey;

                      return (
                        <button
                          type="button"
                          key={catKey}
                          onClick={() => setFormCategory(catKey)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-medium transition cursor-pointer ${
                            isSelected
                              ? 'bg-sky-600/25 border-sky-400 text-sky-200 font-bold shadow-sm'
                              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="text-sm">{cat.icon}</span>
                          <span className="truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Título da Sugestão */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Título Curto da Sugestão
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Ex: Adicionar visualização do analema anual do Sol"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                  />
                </div>

                {/* Conteúdo / Mensagem */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mensagem Detalhada da Sugestão
                  </label>
                  <textarea
                    required
                    rows={4}
                    maxLength={1000}
                    placeholder="Explique como essa melhoria ajudaria a tornar o app mais realista, intuitivo ou completo..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition resize-none"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                    <span>Seja específico: cite opções de menu, cálculos ou visualizações.</span>
                    <span>{formContent.length}/1000</span>
                  </div>
                </div>

                {/* Dispositivo Utilizado */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Em qual dispositivo você mais usa o app?
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'mobile', label: 'Celular (Mobile)', icon: Smartphone },
                      { id: 'desktop', label: 'Computador (PC/Mac)', icon: Laptop },
                      { id: 'tablet', label: 'Tablet / iPad', icon: Tablet },
                    ].map((d) => {
                      const Icon = d.icon;
                      const isSel = formDevice === d.id;
                      return (
                        <button
                          type="button"
                          key={d.id}
                          onClick={() => setFormDevice(d.id as any)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition cursor-pointer flex-1 justify-center ${
                            isSel
                              ? 'bg-sky-600/25 border-sky-400 text-sky-200 font-bold'
                              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{d.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Email para Contato (Opcional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email para Retorno (Opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="seuemail@exemplo.com (caso queira ser notificado quando for lançada)"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                  />
                </div>

                {/* Botão de Enviar */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-sky-600 via-cyan-500 to-sky-500 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 transition duration-200 flex items-center justify-center gap-2 active:scale-95 cursor-pointer mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Publicar Sugestão para a Comunidade</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* CONTEÚDO DA ABA 3: MINHAS MENSAGENS */}
        {activeModalTab === 'my' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white mb-0.5">Sugestões Criadas por Você</h3>
                <p className="text-xs text-slate-400">
                  Todas as sugestões que você submeteu neste navegador ficam salvas e visíveis para a comunidade.
                </p>
              </div>

              <button
                onClick={() => setActiveModalTab('new')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Nova Ideia</span>
              </button>
            </div>

            {userCreatedList.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-3">
                  <MessageSquarePlus className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-300 mb-1">Você ainda não enviou sugestões</h4>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  Clique na aba "Enviar Minha Sugestão" para compartilhar sua primeira ideia de melhoria!
                </p>
                <button
                  onClick={() => setActiveModalTab('new')}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition"
                >
                  Criar Primeira Sugestão
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userCreatedList.map((sug) => {
                  const cat = CATEGORY_LABELS[sug.category];
                  const stat = STATUS_LABELS[sug.status];

                  return (
                    <div
                      key={sug.id}
                      className="p-5 rounded-2xl bg-slate-900/90 border border-sky-500/40 shadow-lg shadow-sky-950/20 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cat.color}`}>
                            {cat.icon} {cat.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stat.badgeColor}`}>
                            {stat.label}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-white mb-2">{sug.title}</h3>
                        <p className="text-xs text-slate-300 leading-relaxed mb-4">{sug.content}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span className="text-[11px] text-slate-400">Votos recebidos: <strong className="text-sky-300">{sug.votes}</strong></span>
                        <span className="text-[10px] text-slate-500">{sug.dateStr}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Caixa de Contato Direto */}
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-950 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-white text-sm">Contato Direto com a Equipe de Engenharia</h5>
                  <p className="text-slate-400 text-xs">
                    Quer enviar um relatório técnico longo, cálculos ou parcerias? Envie um email direto.
                  </p>
                </div>
              </div>

              <a
                href="mailto:rafaelcabraldeoli@gmail.com?subject=Sugestão de Melhoria - SOLA Astronomia 3D"
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl font-semibold text-xs border border-slate-700 transition shrink-0"
              >
                <Mail className="w-4 h-4 text-sky-400" />
                <span>Enviar E-mail Direto</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
