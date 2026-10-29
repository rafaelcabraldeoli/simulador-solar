import React from 'react';
import { Globe, Orbit, Calendar, Star, MoreHorizontal, MessageSquarePlus } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useSimulationStore();

  const tabs = [
    { id: 'system', label: 'Sistema', icon: Globe },
    { id: 'astros', label: 'Astros', icon: Orbit },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'favorites', label: 'Favoritos', icon: Star },
    { id: 'feedback', label: 'Sugestões', icon: MessageSquarePlus },
    { id: 'more', label: 'Mais', icon: MoreHorizontal },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 sm:gap-2 bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-full px-3 py-1.5 shadow-2xl shadow-black/80 pointer-events-auto"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`btn-bottom-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition duration-200 ${
              isActive
                ? 'bg-sky-600/30 border border-sky-400/80 text-sky-200 font-semibold shadow-md shadow-sky-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
