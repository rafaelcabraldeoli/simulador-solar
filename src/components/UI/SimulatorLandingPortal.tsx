import React, { useState } from 'react';
import {
  Compass,
  Globe,
  User,
  Sparkles,
  TrendingUp,
  DollarSign,
  Megaphone,
  Heart,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  X,
  Play,
  ArrowRight,
  ShieldCheck,
  Tv,
  ShoppingBag,
  Award,
  Zap,
  BookOpen,
  Info,
  Clock,
  Eye,
  Layers,
  ChevronRight,
  MessageCircle,
  Mail,
  Share2,
  Star,
  MessageSquarePlus,
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import telescopeImg from '../../assets/images/telescope_ad_1792062688817.jpg';
import binocularImg from '../../assets/images/binocular_ad_1792062689898.jpg';
import astronomyBookImg from '../../assets/images/astronomy_book_ad_1792062689840.jpg';
import phoneAdapterImg from '../../assets/images/phone_adapter_ad_1792062690628.jpg';
import planarModeImg from '../../assets/images/planar_mesmo_nivel_perfeito_1792426085858.jpg';
import globeModeImg from '../../assets/images/globe_mode_cover_1792063495255.jpg';
import observerModeImg from '../../assets/images/observer_mode_cover_1792063495107.jpg';

export const SimulatorLandingPortal: React.FC = () => {
  const {
    isLandingPortalOpen,
    setIsLandingPortalOpen,
    setTheoryMode,
    setCameraMode,
    triggerSystemLoading,
    setActiveTab,
  } = useSimulationStore();

  const [showAdModal, setShowAdModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<number | null>(20);

  if (!isLandingPortalOpen) return null;

  const handleLaunchPlanar = () => {
    setIsLandingPortalOpen(false);
    setTheoryMode('planar');
    setCameraMode('earth');
  };

  const handleLaunchGlobe = () => {
    setIsLandingPortalOpen(false);
    setTheoryMode('globe');
  };

  const handleLaunchHuman = () => {
    setIsLandingPortalOpen(false);
    setTheoryMode('planar');
    setCameraMode('human');
  };

  const handleCopyPix = () => {
    const pixKey = '230ba68f-f093-4b9f-8363-ff0a4567e6ce';
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 backdrop-blur-xl text-slate-100 flex flex-col items-center select-none animate-in fade-in duration-300">
      {/* Background ambient cosmic glow rings */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-sky-500/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative w-full max-w-6xl px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between z-10 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-wider bg-gradient-to-r from-white via-sky-200 to-cyan-400 bg-clip-text text-transparent">
              SOLA ASTRONOMIA 3D
            </h1>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Sistema de Observação e Laboratório Astronômico Interativo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Sugestões de Melhorias */}
          <button
            onClick={() => {
              setIsLandingPortalOpen(false);
              setActiveTab('feedback');
            }}
            title="Aba de Mensagens & Sugestões para Melhorar o App"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/25 hover:border-sky-400 transition shadow-sm active:scale-95"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Sugestões</span>
            <span className="sm:hidden">Sugestões</span>
          </button>

          {/* Botão Apoiar Projeto (PIX) para visitantes */}
          <button
            onClick={handleCopyPix}
            title="Apoie os servidores e o projeto via PIX direto (Chave: 230ba68f-f093-4b9f-8363-ff0a4567e6ce)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-400 transition shadow-sm active:scale-95"
          >
            <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/30" />
            <span className="hidden sm:inline">{copiedPix ? 'Chave PIX Copiada!' : 'Apoiar via PIX'}</span>
            <span className="sm:hidden">{copiedPix ? 'Copiado!' : 'PIX'}</span>
          </button>

          {/* Botão Anuncie Aqui para anunciantes */}
          <button
            onClick={() => setShowAdModal(true)}
            title="Espaços publicitários e patrocínios"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 transition shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Megaphone className="w-3.5 h-3.5 text-slate-950" />
            <span>Anuncie Aqui</span>
          </button>
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col z-10">
        {/* Title & Prompt */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/25 text-sky-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Simulador 3D Fotorealista com Física e Efemérides Reais</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-3">
            Escolha em qual experiência astronômica você deseja interagir
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Selecione um dos modelos abaixo para explorar as órbitas, ciclo dia e noite, estações do ano,
            eclipses, constelações e a perspectiva humana em tempo real.
          </p>
        </div>

        {/* 3 Simulator Choices Cards com Imagens Intuitivas em Alta Resolução */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 pt-4">
          {/* CARD 1: SIMULADOR PLANO */}
          <div className="group relative rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900 to-slate-950 border border-sky-500/40 hover:border-sky-400 p-4 sm:p-5 flex flex-col justify-between shadow-xl shadow-sky-950/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-sky-500/25">
            <div className="absolute -top-3.5 left-6 z-30 px-3.5 py-0.5 bg-gradient-to-r from-sky-600 via-cyan-500 to-sky-500 rounded-full text-[10px] font-extrabold text-white uppercase tracking-wider shadow-lg ring-1 ring-white/20">
              Mais Acessado • Modelo Gleeson
            </div>

            <div>
              {/* Imagem Intuitiva do Modo Plano */}
              <div 
                onClick={handleLaunchPlanar}
                className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-4 border border-sky-500/30 group-hover:border-sky-400 cursor-pointer shadow-lg bg-slate-950"
              >
                <img
                  src={planarModeImg}
                  alt="Simulador Terra Plana 3D com nível do oceano perfeitamente uniforme dentro e fora da Antártida"
                  className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-700 brightness-95 group-hover:brightness-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Título & Descrição */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 group-hover:bg-sky-500/25 transition">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition">
                  Simulador Plano
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Disco com os continentes conhecidos e o cinturão de gelo da Antártida,
                com nível do mar uniforme dentro e fora da muralha e astros locais.
              </p>

              <ul className="space-y-1.5 text-[11px] text-slate-300 mb-5">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Projeção Azimutal Equidistante (Mapa Gleason HD)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Nível do oceano perfeitamente igual dentro e fora da Antártida</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Muralha de gelo sólida sem fendas abertas e horizonte plano</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Camadas atmosféricas, cúpula opcional e água primordial</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleLaunchPlanar}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 via-cyan-500 to-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 hover:brightness-110 active:scale-[0.98] transition group-hover:shadow-sky-500/50 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Iniciar Simulador Plano</span>
            </button>
          </div>

          {/* CARD 2: SIMULADOR ESFÉRICO */}
          <div className="group relative rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900 to-slate-950 border border-indigo-500/40 hover:border-indigo-400 p-4 sm:p-5 flex flex-col justify-between shadow-xl shadow-indigo-950/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-500/25">
            <div className="absolute -top-3.5 left-6 z-30 px-3.5 py-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-500 rounded-full text-[10px] font-extrabold text-white uppercase tracking-wider shadow-lg ring-1 ring-white/20">
              Modelo Heliocêntrico 3D
            </div>

            <div>
              {/* Imagem Intuitiva do Modo Esférico */}
              <div 
                onClick={handleLaunchGlobe}
                className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-4 border border-indigo-500/30 group-hover:border-indigo-400 cursor-pointer shadow-lg bg-slate-950"
              >
                <img
                  src={globeModeImg}
                  alt="Simulador Terra Esférica Globo 3D"
                  className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-700 brightness-95 group-hover:brightness-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Título & Descrição */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-500/25 transition">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                  Simulador Esférico
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Física tridimensional do planeta esférico em rotação axial no vácuo espacial, com atmosfera Rayleigh,
                linha terminadora dia/noite e os planetas do Sistema Solar.
              </p>

              <ul className="space-y-1.5 text-[11px] text-slate-300 mb-5">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Globo 3D com rotação de 24h e inclinação axial</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Estações do ano e solstícios/equinócios</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Sistema Solar completo com órbitas dos planetas</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Auroras polares e atmosfera Rayleigh em tempo real</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleLaunchGlobe}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:brightness-110 active:scale-[0.98] transition group-hover:shadow-indigo-500/50 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Iniciar Simulador Esférico</span>
            </button>
          </div>

          {/* CARD 3: VISÃO HUMANA EM 1ª PESSOA */}
          <div className="group relative rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900 to-slate-950 border border-emerald-500/40 hover:border-emerald-400 p-4 sm:p-5 flex flex-col justify-between shadow-xl shadow-emerald-950/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-500/25">
            <div className="absolute -top-3.5 left-6 z-30 px-3.5 py-0.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 rounded-full text-[10px] font-extrabold text-white uppercase tracking-wider shadow-lg ring-1 ring-white/20">
              Visão Imersiva em Terra
            </div>

            <div>
              {/* Imagem Intuitiva do Modo Observador */}
              <div 
                onClick={handleLaunchHuman}
                className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-4 border border-emerald-500/30 group-hover:border-emerald-400 cursor-pointer shadow-lg bg-slate-950"
              >
                <img
                  src={observerModeImg}
                  alt="Modo Observador Humano no Horizonte"
                  className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-700 brightness-95 group-hover:brightness-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Título & Descrição */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-500/25 transition">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">
                  Visão do Observador Humano
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Pise em solo firme em qualquer cidade do planeta e olhe o horizonte em 1ª pessoa:
                veja o Sol nascer e se pôr na linha de visão humana de 5 km com bússola graduada em tempo real.
              </p>

              <ul className="space-y-1.5 text-[11px] text-slate-300 mb-5">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Perspectiva em 1ª pessoa a partir do nível do solo</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Trajetória do Sol e da Lua no horizonte visível</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>HUD com azimute, altitude em graus e pontos cardeais</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Biomas terrestres 3D: campos, montanhas, praia e cidades</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleLaunchHuman}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 hover:brightness-110 active:scale-[0.98] transition group-hover:shadow-emerald-500/50 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Entrar com Visão Humana</span>
            </button>
          </div>
        </div>

        {/* SECTION: MONETIZAÇÃO, PUBLICIDADE & APOIO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {/* BANNER 1: ANUNCIE AQUI (ESPAÇO PUBLICITÁRIO OFICIAL) */}
          <div className="lg:col-span-2 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-950 border border-amber-500/40 p-5 sm:p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold tracking-wide">
                  <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>ESPAÇO DE PATROCÍNIO E PROPAGANDA</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-white">
                  Anuncie sua Marca, Canal no YouTube ou Produto Aqui
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Alcance milhares de estudantes, professores, pesquisadores e entusiastas de astronomia todos os meses.
                  Disponibilizamos banners de topo, menções no carregamento e destaques na barra lateral.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-amber-300/90 font-medium">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    +45.000 visualizações mensais
                  </span>
                  <span>•</span>
                  <span>Público qualificado em ciências e educação</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">Planos a partir de R$ 49/semana</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => setShowAdModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition"
                >
                  <Megaphone className="w-4 h-4 text-slate-950" />
                  <span>Ver Planos & Anunciar</span>
                </button>
              </div>
            </div>
          </div>

          {/* BANNER 2: APOIE COM PIX */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-emerald-500/40 p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                  <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/40" />
                  <span>APOIO AO DESENVOLVEDOR</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  PIX Direto
                </span>
              </div>
              <h4 className="text-base font-bold text-white mb-1.5">
                Ajude a manter os servidores ativos
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                Contribua com qualquer valor para acelerar o desenvolvimento de novas ferramentas cósmicas e servidores 3D.
              </p>

              {/* Caixa Destacada da Chave PIX */}
              <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-3 mb-3 flex items-center justify-between gap-2 shadow-inner">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Chave PIX (Aleatória / EVP)
                  </div>
                  <div className="text-xs sm:text-sm font-mono font-black text-emerald-400 tracking-wider truncate" title="230ba68f-f093-4b9f-8363-ff0a4567e6ce">
                    230ba68f-f093-4b9f-8363-ff0a4567e6ce
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Banco: <span className="text-slate-300 font-medium">Nubank (Ag. 0001 • Conta 36292375-3)</span>
                  </div>
                </div>
                <button
                  onClick={handleCopyPix}
                  title="Copiar Chave PIX"
                  className="p-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition active:scale-95 flex items-center gap-1 text-xs font-bold shrink-0"
                >
                  {copiedPix ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline">Copiar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Botões de Valores Sugeridos */}
              <div className="flex items-center gap-2 mb-3">
                {[5, 10, 20, 50].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSelectedDonation(val)}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-xs font-bold border transition ${
                      selectedDonation === val
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    R$ {val}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCopyPix}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition active:scale-98"
            >
              {copiedPix ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Chave PIX Copiada com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white" />
                  <span className="truncate">Copiar Chave PIX: 230ba68f-f093-4b9f...</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* VITRINE DE EQUIPAMENTOS RECOMENDADOS (AMAZON ASSOCIADOS)      */}
        {/* ============================================================== */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900/95 to-slate-950 border border-indigo-500/30 p-5 sm:p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    Equipamentos Astronômicos & Livros Recomendados
                  </h4>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                    Ofertas Amazon
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Instrumentos selecionados para você observar o céu real. Ao comprar pela Amazon, você apoia o projeto SOLA sem pagar nada a mais!
                </p>
              </div>
            </div>

            <a
              href="https://www.amazon.com.br/s?k=astronomia+telescopio&tag=solaastronomi-20"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold transition shrink-0"
            >
              <span>Ver Loja Completa</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Grid de Produtos Afiliados com Fotos Reais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Produto 1: Telescópio */}
            <div className="rounded-2xl bg-slate-950/90 border border-slate-800/90 hover:border-indigo-500/60 p-3.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group">
              <div>
                {/* Foto Real do Produto */}
                <a
                  href="https://www.amazon.com.br/s?k=telescopio+astronomico+70mm&tag=solaastronomi-20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 mb-3 group/img shadow-inner"
                >
                  <img
                    src={telescopeImg}
                    alt="Telescópio Astronômico Profissional"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />
                  
                  {/* Badges sobre a foto */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-600/90 text-white backdrop-blur-md shadow-md">
                    Observação Planetária
                  </span>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/85 text-amber-300 border border-amber-400/30 backdrop-blur-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>4.9</span>
                  </span>
                  <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-slate-200 bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur-md">
                    Mais Buscado • 70mm a 114mm
                  </span>
                </a>

                <h5 className="text-sm font-bold text-white group-hover:text-indigo-300 transition line-clamp-2 mb-1">
                  Telescópios Astronômicos (70mm a 114mm)
                </h5>
                <p className="text-[11px] text-slate-400 line-clamp-3 mb-3 leading-relaxed">
                  Perfeito para avistar crateras lunares, anéis de Saturno e as luas de Júpiter com foco nítido e montagem estável.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] mb-2 px-0.5">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Envio Prime
                  </span>
                  <span className="text-slate-400 text-[10px]">Garantia Amazon</span>
                </div>
                <a
                  href="https://www.amazon.com.br/s?k=telescopio+astronomico+70mm&tag=solaastronomi-20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/50 transition active:scale-95"
                >
                  <span>Ver Ofertas na Amazon</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Produto 2: Binóculo 10x50 */}
            <div className="rounded-2xl bg-slate-950/90 border border-slate-800/90 hover:border-sky-500/60 p-3.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 group">
              <div>
                {/* Foto Real do Produto */}
                <a
                  href="https://www.amazon.com.br/s?k=binoculo+astronomico+10x50&tag=solaastronomi-20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 mb-3 group/img shadow-inner"
                >
                  <img
                    src={binocularImg}
                    alt="Binóculos Astronômicos 10x50"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Badges sobre a foto */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-sky-600/90 text-white backdrop-blur-md shadow-md">
                    Campo Amplo 10x50
                  </span>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/85 text-amber-300 border border-amber-400/30 backdrop-blur-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>4.8</span>
                  </span>
                  <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-slate-200 bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur-md">
                    Lentes com Anti-Reflexo
                  </span>
                </a>

                <h5 className="text-sm font-bold text-white group-hover:text-sky-300 transition line-clamp-2 mb-1">
                  Binóculos Astronômicos 10x50 / 20x50
                </h5>
                <p className="text-[11px] text-slate-400 line-clamp-3 mb-3 leading-relaxed">
                  Essencial para iniciantes e veteranos: localiza aglomerados estelares, nebulosas brilhantes e a Via Láctea com conforto visual.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] mb-2 px-0.5">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Envio Rápido
                  </span>
                  <span className="text-slate-400 text-[10px]">Alta Portabilidade</span>
                </div>
                <a
                  href="https://www.amazon.com.br/s?k=binoculo+astronomico+10x50&tag=solaastronomi-20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/50 transition active:scale-95"
                >
                  <span>Ver Ofertas na Amazon</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Produto 3: Livros de Astronomia */}
            <div className="rounded-2xl bg-slate-950/90 border border-slate-800/90 hover:border-emerald-500/60 p-3.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 group">
              <div>
                {/* Foto Real do Produto */}
                <a
                  href="https://www.amazon.com.br/s?k=livro+astronomia+cosmos+carl+sagan&tag=solaastronomi-20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 mb-3 group/img shadow-inner"
                >
                  <img
                    src={astronomyBookImg}
                    alt="Livro Cosmos Carl Sagan e Astronomia"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Badges sobre a foto */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-600/90 text-white backdrop-blur-md shadow-md">
                    Edição Ilustrada
                  </span>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/85 text-amber-300 border border-amber-400/30 backdrop-blur-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>5.0</span>
                  </span>
                  <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-slate-200 bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur-md">
                    Cosmos • Carl Sagan
                  </span>
                </a>

                <h5 className="text-sm font-bold text-white group-hover:text-emerald-300 transition line-clamp-2 mb-1">
                  Livros: Cosmos, Guia do Céu & Astrofísica
                </h5>
                <p className="text-[11px] text-slate-400 line-clamp-3 mb-3 leading-relaxed">
                  As maiores obras de divulgação científica, cartas celestes e mapas das constelações para você dominar o céu.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] mb-2 px-0.5">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Best-Seller
                  </span>
                  <span className="text-slate-400 text-[10px]">Capa Dura & Colorido</span>
                </div>
                <a
                  href="https://www.amazon.com.br/s?k=livro+astronomia+cosmos+carl+sagan&tag=solaastronomi-20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/50 transition active:scale-95"
                >
                  <span>Ver Livros na Amazon</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Produto 4: Acessório Astrofotografia */}
            <div className="rounded-2xl bg-slate-950/90 border border-slate-800/90 hover:border-amber-500/60 p-3.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 group">
              <div>
                {/* Foto Real do Produto */}
                <a
                  href="https://www.amazon.com.br/s?k=adaptador+celular+para+telescopio&tag=solaastronomi-20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 mb-3 group/img shadow-inner"
                >
                  <img
                    src={phoneAdapterImg}
                    alt="Adaptador de Celular para Telescópio"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Badges sobre a foto */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-orange-600/90 text-white backdrop-blur-md shadow-md">
                    Astrofotografia
                  </span>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/85 text-amber-300 border border-amber-400/30 backdrop-blur-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>4.7</span>
                  </span>
                  <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-slate-200 bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur-md">
                    Universal • Smartphone
                  </span>
                </a>

                <h5 className="text-sm font-bold text-white group-hover:text-amber-300 transition line-clamp-2 mb-1">
                  Adaptador de Celular para Telescópio
                </h5>
                <p className="text-[11px] text-slate-400 line-clamp-3 mb-3 leading-relaxed">
                  Conecte seu smartphone na ocular do telescópio ou binóculo e fotografe a Lua e os planetas em alta resolução.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] mb-2 px-0.5">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Fácil Instalação
                  </span>
                  <span className="text-slate-400 text-[10px]">Foto & Vídeo</span>
                </div>
                <a
                  href="https://www.amazon.com.br/s?k=adaptador+celular+para+telescopio&tag=solaastronomi-20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/50 transition active:scale-95"
                >
                  <span>Ver Acessórios na Amazon</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* BANNER DE SUGESTÕES DOS USUÁRIOS */}
        <div className="w-full rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900 to-cyan-950/70 border border-sky-500/40 p-5 sm:p-6 mb-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0 shadow-md">
              <MessageSquarePlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base sm:text-lg font-bold text-white">
                  Aba de Mensagens & Sugestões da Comunidade
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Novo
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-0.5">
                Tem ideias para novos recursos, cálculos ou melhorias visuais? Envie suas sugestões e vote nas melhores propostas da comunidade para aprimorar o app!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsLandingPortalOpen(false);
              setActiveTab('feedback');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-500 hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-950 active:scale-95 transition cursor-pointer shrink-0"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Abrir Aba de Sugestões</span>
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-6xl px-4 sm:px-6 py-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 z-10">
        <p>© 2026 SOLA • Sistema de Observação e Laboratório Astronômico</p>
        <div className="flex items-center gap-4 text-slate-400">
          <button
            onClick={() => {
              setIsLandingPortalOpen(false);
              setActiveTab('feedback');
            }}
            className="hover:text-sky-300 transition flex items-center gap-1"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-sky-400" />
            <span>Sugestões</span>
          </button>
          <span>•</span>
          <button onClick={() => setShowAdModal(true)} className="hover:text-amber-400 transition">
            Anunciar
          </button>
          <span>•</span>
          <button onClick={handleLaunchPlanar} className="hover:text-sky-400 transition">
            Modo Planar
          </button>
          <span>•</span>
          <button onClick={handleLaunchGlobe} className="hover:text-indigo-400 transition">
            Modo Globo
          </button>
          <span>•</span>
          {/* Acesso discreto e exclusivo para o Dono acessar o Manual de Monetização */}
          <button
            onClick={() => setShowGuideModal(true)}
            title="Acesso do Administrador: Manual com estratégias para lucrar com o sistema"
            className="text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[11px]">Área do Dono</span>
          </button>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* MODAL 1: ANUNCIE AQUI (PLANOS DE PUBLICIDADE & CONTATO)       */}
      {/* ============================================================== */}
      {showAdModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/50 rounded-2xl p-6 shadow-2xl text-slate-100 my-8">
            <button
              onClick={() => setShowAdModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-amber-400 mb-2">
              <Megaphone className="w-6 h-6" />
              <h3 className="text-xl font-bold">Mídia Kit • Anuncie no Simulador SOLA</h3>
            </div>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Exponha sua marca, loja de instrumentos ópticos, canal de divulgação científica, curso ou produto
              diretamente para um público engajado e altamente qualificado.
            </p>

            {/* Tabela de Planos de Anúncio */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Básico</span>
                  <h4 className="font-bold text-white text-sm mt-1">Banner no Rodapé</h4>
                  <div className="text-lg font-black text-amber-400 mt-2">R$ 49 <span className="text-xs text-slate-400 font-normal">/ semana</span></div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Banner compacto na área inferior ou na tela inicial do portal com link direto para seu site.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/50 flex flex-col justify-between relative shadow-lg">
                <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full uppercase">
                  Recomendado
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Profissional</span>
                  <h4 className="font-bold text-white text-sm mt-1">Destaque na Barra 3D</h4>
                  <div className="text-lg font-black text-amber-400 mt-2">R$ 149 <span className="text-xs text-slate-400 font-normal">/ mês</span></div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Card patrocinado com ícone da sua marca fixo na barra lateral ou no topo do simulador.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exclusivo</span>
                  <h4 className="font-bold text-white text-sm mt-1">Patrocínio Master</h4>
                  <div className="text-lg font-black text-amber-400 mt-2">R$ 390 <span className="text-xs text-slate-400 font-normal">/ mês</span></div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Sua marca exibida como &quot;Apresentado por [Sua Marca]&quot; na tela de abertura e em todos os cards.
                  </p>
                </div>
              </div>
            </div>

            {/* Como Contratar / Contato */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-5">
              <h5 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Como fechar seu anúncio com o administrador:</span>
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Envie uma mensagem informando qual o produto ou link deseja divulgar.
                Configuramos o banner em menos de 24 horas no ar!
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <a
                  href="https://wa.me/5537991449754?text=Ol%C3%A1!%20Tenho%20interesse%20em%20anunciar%20no%20Simulador%20Astron%C3%B4mico%20SOLA."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp: (37) 99144-9754</span>
                </a>
                <button
                  onClick={handleCopyPix}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition"
                >
                  <Copy className="w-4 h-4 text-emerald-400" />
                  <span className="truncate">Copiar Chave PIX: 230ba68f...</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowAdModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: GUIA COMPLETO DE COMO GANHAR DINHEIRO COM O SISTEMA   */}
      {/* ============================================================== */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 sm:p-7 shadow-2xl text-slate-100 my-8">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-emerald-400 mb-2">
              <DollarSign className="w-7 h-7" />
              <h3 className="text-xl sm:text-2xl font-black">
                Manual de Monetização: Como Ganhar Dinheiro com este Simulador
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              Você tem em mãos uma ferramenta tecnológica de alto impacto visual e educacional!
              Abaixo estão os <strong>5 caminhos comprovados</strong> para transformar acessos em renda real:
            </p>

            <div className="space-y-4 mb-6">
              {/* FORMA 1: VENDA DIRETA DE ANÚNCIOS (100% SEU) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                    <span>1. Venda Direta de Espaço Publicitário (&quot;Anuncie Aqui&quot;)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">100% de Lucro</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Você mesmo pode cobrar de anunciantes sem intermediários! Ofereça o banner da página inicial e
                    da barra lateral para:
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-slate-400 mt-1.5 space-y-1">
                    <li><strong>Canais do YouTube e Podcasts:</strong> Criadores adoram divulgar seus canais em simuladores temáticos.</li>
                    <li><strong>Lojas de Telescópios e Acessórios:</strong> Lojas virtuais de instrumentos ópticos e lentes.</li>
                    <li><strong>Livrarias e Autores:</strong> Autores de livros sobre astronomia, mapas ou modelos cosmológicos.</li>
                  </ul>
                </div>
              </div>

              {/* FORMA 2: MARKETING DE AFILIADOS */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                    <span>2. Links de Afiliados (Amazon, Shopee, Mercado Livre)</span>
                    <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold">Comissão de 8% a 15%</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Cadastre-se gratuitamente no programa de <strong>Associados da Amazon</strong> e adicione botões como:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-[11px]">
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
                      🔭 <strong>Telescópios Recomendados:</strong> cada venda gera de R$ 80 a R$ 300 de comissão direta para você.
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
                      🗺️ <strong>Mapas Gleeson & Globos:</strong> mapas físicos impressos e globos para estudo em casa.
                    </div>
                  </div>
                </div>
              </div>

              {/* FORMA 3: GOOGLE ADSENSE */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <Tv className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                    <span>3. Google AdSense (Anúncios Automáticos Pagos em Dólar)</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">Ganho Passivo em Dólar</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Quando você colocar o simulador no seu domínio próprio (ex: <code>seusimulador.com.br</code>),
                    você pode aprovar o site no Google AdSense. A cada pessoa que visita ou visualiza anúncios,
                    o Google deposita dólares diretamente na sua conta corrente via banco.
                  </p>
                </div>
              </div>

              {/* FORMA 4: DOAÇÕES VIA PIX E SUPERCHAT */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="w-full">
                  <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                    <span>4. Doações Espontâneas (PIX Ativo)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Imediato</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                    Grave vídeos ou faça transmissões ao vivo no <strong>TikTok, YouTube ou Instagram</strong> mostrando o funcionamento
                    do simulador (ex: como acontecem os eclipses, a velocidade das nuvens, a visão humana). Deixe seu QR Code do PIX na tela.
                    Muitos espectadores doam de R$ 5 a R$ 50 para incentivar o projeto!
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 bg-slate-900 rounded-lg border border-emerald-500/30">
                    <span className="text-[11px] text-slate-300 shrink-0">Chave PIX (Aleatória / Nubank):</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 break-all select-all">230ba68f-f093-4b9f-8363-ff0a4567e6ce</span>
                    <button
                      onClick={handleCopyPix}
                      className="sm:ml-auto px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition shrink-0"
                    >
                      {copiedPix ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* FORMA 5: LICENCIAMENTO PARA ESCOLAS E CURSOS */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                    <span>5. Licença Escolar / Versão sem Anúncios para Professores</span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">Alto Valor</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Você pode oferecer pacotes para colégios e professores de geografia e ciências utilizarem
                    em aulas práticas de informática com projeção em telão, cobrando mensalidade por colégio.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <p className="text-[11px] text-slate-400">
                🚀 Dica de ouro: Comece divulgando pequenos vídeos da visão 3D nas redes sociais para atrair os primeiros visitantes!
              </p>
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                Entendi, Vamos Começar!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
