import React, { useState, useEffect } from 'react';
import {
  X,
  CloudRain,
  Sun,
  Cloud,
  CloudLightning,
  Snowflake,
  Wind,
  Droplets,
  Thermometer,
  Compass,
  RefreshCw,
  Search,
  MapPin,
  Sparkles,
  Layers,
  Eye,
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import {
  fetchLiveWeather,
  fetchGlobalWeatherBatch,
  GLOBAL_WEATHER_STATIONS,
  LiveWeatherData,
  WeatherStationPreset,
} from '../../services/weatherService';

interface WeatherModalProps {
  onSelectStation?: (station: LiveWeatherData) => void;
  onRefreshAll?: () => void;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({ onSelectStation, onRefreshAll }) => {
  const {
    activeSidebarTool,
    setActiveSidebarTool,
    layers,
    toggleLayer,
    settings,
    updateSettings,
  } = useSimulationStore();

  const [stationsData, setStationsData] = useState<LiveWeatherData[]>([]);
  const [selectedStation, setSelectedStation] = useState<LiveWeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'rain' | 'thunderstorm' | 'clear' | 'cloudy' | 'snow'>('all');
  const [selectedContinent, setSelectedContinent] = useState<string>('all');
  const [customSearchLoading, setCustomSearchLoading] = useState<boolean>(false);

  // Initial load of global stations
  useEffect(() => {
    let isMounted = true;
    const loadStations = async () => {
      setLoading(true);
      try {
        const results = await fetchGlobalWeatherBatch(GLOBAL_WEATHER_STATIONS);
        if (isMounted) {
          setStationsData(results);
          if (results.length > 0 && !selectedStation) {
            setSelectedStation(results[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching batch weather:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStations();
    return () => {
      isMounted = false;
    };
  }, []);

  if (activeSidebarTool !== 'weather') return null;

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const results = await fetchGlobalWeatherBatch(GLOBAL_WEATHER_STATIONS);
      setStationsData(results);
      if (selectedStation) {
        const updated = results.find(
          (s) => s.cityName === selectedStation.cityName
        );
        if (updated) setSelectedStation(updated);
      }
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error('Error refreshing weather:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStation = (station: LiveWeatherData) => {
    setSelectedStation(station);
    updateSettings({
      observerLat: station.latitude,
      observerLng: station.longitude,
      observerLocationName: station.cityName || 'Estação Meteorológica',
    });
    if (onSelectStation) {
      onSelectStation(station);
    }
  };

  const handleCustomSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setCustomSearchLoading(true);
    try {
      // Check if coordinates or city name
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        searchQuery.trim()
      )}&count=1&language=pt&format=json`;
      const res = await fetch(geoUrl);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const place = data.results[0];
        const live = await fetchLiveWeather(
          place.latitude,
          place.longitude,
          place.name,
          place.country
        );
        setStationsData((prev) => [live, ...prev.filter((p) => p.cityName !== live.cityName)]);
        setSelectedStation(live);
        updateSettings({
          observerLat: live.latitude,
          observerLng: live.longitude,
          observerLocationName: live.cityName || place.name,
        });
        if (onSelectStation) onSelectStation(live);
      } else {
        alert('Cidade não encontrada. Tente o nome em português ou inglês.');
      }
    } catch (err) {
      console.error('Geocoding search error:', err);
    } finally {
      setCustomSearchLoading(false);
    }
  };

  // Filter stations
  const filteredStations = stationsData.filter((s) => {
    // Category filter
    if (filterCategory === 'rain' && s.weatherCategory !== 'rain' && s.weatherCategory !== 'drizzle') return false;
    if (filterCategory === 'thunderstorm' && s.weatherCategory !== 'thunderstorm') return false;
    if (filterCategory === 'clear' && s.weatherCategory !== 'clear') return false;
    if (filterCategory === 'cloudy' && s.weatherCategory !== 'cloudy' && s.weatherCategory !== 'fog') return false;
    if (filterCategory === 'snow' && s.weatherCategory !== 'snow') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCity = s.cityName?.toLowerCase().includes(q);
      const matchCountry = s.countryName?.toLowerCase().includes(q);
      const matchStatus = s.weatherStatusPt.toLowerCase().includes(q);
      if (!matchCity && !matchCountry && !matchStatus) return false;
    }

    return true;
  });

  return (
    <div
      id="modal-weather-radar"
      className="fixed md:absolute top-14 md:top-20 left-2 sm:left-20 right-2 sm:right-auto z-40 w-auto sm:w-[580px] lg:w-[720px] max-w-[calc(100vw-16px)] max-h-[85vh] bg-slate-950/95 backdrop-blur-2xl border border-sky-500/40 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl shadow-black/90 flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <CloudRain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-100 flex items-center gap-2">
              Clima & Meteorologia em Tempo Real
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Satélites
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Sincronização global de Sol, céu limpo, nebulosidade, chuvas e tempestades 3D
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-refresh-weather"
            onClick={handleRefresh}
            disabled={loading}
            title="Atualizar dados meteorológicos"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-sky-300 hover:border-sky-500/50 transition duration-150 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
          <button
            id="btn-close-weather-modal"
            onClick={() => setActiveSidebarTool(null)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Quick 3D Layer Toggles */}
      <div className="mt-3 grid grid-cols-2 gap-2 flex-shrink-0">
        <button
          id="btn-toggle-live-weather-badges"
          onClick={() => toggleLayer('showLiveWeather')}
          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition ${
            layers.showLiveWeather
              ? 'bg-sky-950/60 border-sky-500/50 text-sky-200'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Badges do Clima no Mapa 3D
          </span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              layers.showLiveWeather ? 'bg-sky-500/30 text-sky-300' : 'bg-slate-800 text-slate-500'
            }`}
          >
            {layers.showLiveWeather ? 'LIGADO' : 'DESLIGADO'}
          </span>
        </button>

        <button
          id="btn-toggle-live-precipitation"
          onClick={() => toggleLayer('showLivePrecipitation')}
          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition ${
            layers.showLivePrecipitation
              ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <CloudRain className="w-3.5 h-3.5 text-indigo-400" />
            Precipitação 3D (Chuva/Neve/Raios)
          </span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              layers.showLivePrecipitation
                ? 'bg-indigo-500/30 text-indigo-300'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {layers.showLivePrecipitation ? 'LIGADO' : 'DESLIGADO'}
          </span>
        </button>
      </div>

      {/* 3. Search Bar */}
      <form onSubmit={handleCustomSearch} className="mt-3 flex gap-2 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            id="input-weather-search"
            type="text"
            placeholder="Buscar qualquer cidade do mundo (ex: São Paulo, Paris, Tóquio, Miami)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
        </div>
        <button
          id="btn-submit-weather-search"
          type="submit"
          disabled={customSearchLoading}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
        >
          {customSearchLoading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <MapPin className="w-3.5 h-3.5" />
          )}
          Buscar
        </button>
      </form>

      {/* 4. Filter Pills */}
      <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 flex-shrink-0 no-scrollbar">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
            filterCategory === 'all'
              ? 'bg-slate-200 text-slate-950'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Todas as Estações ({stationsData.length})
        </button>
        <button
          onClick={() => setFilterCategory('rain')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
            filterCategory === 'rain'
              ? 'bg-sky-500 text-slate-950'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-sky-300'
          }`}
        >
          🌧️ Com Chuva
        </button>
        <button
          onClick={() => setFilterCategory('thunderstorm')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
            filterCategory === 'thunderstorm'
              ? 'bg-red-500 text-slate-950'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-300'
          }`}
        >
          ⛈️ Tempestades & Raios
        </button>
        <button
          onClick={() => setFilterCategory('clear')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
            filterCategory === 'clear'
              ? 'bg-amber-400 text-slate-950'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-300'
          }`}
        >
          ☀️ Céu Limpo / Sol
        </button>
        <button
          onClick={() => setFilterCategory('cloudy')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
            filterCategory === 'cloudy'
              ? 'bg-slate-400 text-slate-950'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          ☁️ Nublado / Nebuloso
        </button>
        <button
          onClick={() => setFilterCategory('snow')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
            filterCategory === 'snow'
              ? 'bg-cyan-300 text-slate-950'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-200'
          }`}
        >
          ❄️ Neve
        </button>
      </div>

      {/* 5. Scrollable Body */}
      <div className="mt-3 flex-1 overflow-y-auto pr-1 space-y-3.5 custom-scrollbar">
        {/* Active Selected Station Spotlight Card */}
        {selectedStation && (
          <div
            id="selected-weather-station-card"
            className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 via-sky-950/40 to-slate-900/90 border border-sky-500/40 shadow-lg relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Estação em Foco no Mapa
                </span>
                <h4 className="text-lg font-black text-slate-100 mt-0.5">
                  {selectedStation.cityName}
                  {selectedStation.countryName && (
                    <span className="text-xs font-normal text-slate-400 ml-1.5">
                      ({selectedStation.countryName})
                    </span>
                  )}
                </h4>
                <p className="text-xs font-semibold text-sky-300 flex items-center gap-1.5 mt-0.5">
                  <span className="text-base">{selectedStation.icon}</span>
                  {selectedStation.weatherStatusPt}
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black text-slate-100 font-mono">
                  {Math.round(selectedStation.temperature)}°C
                </span>
                <p className="text-[11px] text-slate-400">
                  Sensação: {Math.round(selectedStation.apparentTemperature)}°C
                </p>
              </div>
            </div>

            {/* Weather Telemetry Matrix */}
            <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-sky-400" />
                  Nebulosidade
                </span>
                <p className="text-sm font-bold text-slate-200 mt-0.5 font-mono">
                  {selectedStation.cloudCover}%
                </p>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                  <div
                    className="bg-sky-400 h-full rounded-full"
                    style={{ width: `${selectedStation.cloudCover}%` }}
                  />
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  Precipitação
                </span>
                <p className="text-sm font-bold text-slate-200 mt-0.5 font-mono">
                  {selectedStation.precipitation.toFixed(1)} mm/h
                </p>
                <span className="text-[9px] text-slate-500">
                  {selectedStation.rain > 0
                    ? `Chuva: ${selectedStation.rain.toFixed(1)}mm`
                    : selectedStation.snowfall > 0
                    ? `Neve: ${selectedStation.snowfall}cm`
                    : 'Sem precipitação'}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-400" />
                  Umidade Relativa
                </span>
                <p className="text-sm font-bold text-slate-200 mt-0.5 font-mono">
                  {selectedStation.humidity}%
                </p>
                <span className="text-[9px] text-slate-500">Pressão / Vapor</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Wind className="w-3 h-3 text-teal-400" />
                  Vento
                </span>
                <p className="text-sm font-bold text-slate-200 mt-0.5 font-mono">
                  {Math.round(selectedStation.windSpeed)} km/h
                </p>
                <span className="text-[9px] text-slate-500">
                  Dir: {Math.round(selectedStation.windDirection)}°
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Global Stations List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Estações Meteorológicas no Globo ({filteredStations.length})
            </h4>
            <span className="text-[11px] text-slate-500">Clique para inspecionar</span>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/60">
              <RefreshCw className="w-6 h-6 text-sky-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium">
                Conectando aos satélites e estações meteorológicas em tempo real...
              </p>
            </div>
          ) : filteredStations.length === 0 ? (
            <div className="p-6 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-xs text-slate-400">
              Nenhuma estação meteorológica encontrada com os filtros atuais.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredStations.map((station) => {
                const isSelected =
                  selectedStation?.cityName === station.cityName;
                const isRain =
                  station.weatherCategory === 'rain' ||
                  station.weatherCategory === 'thunderstorm' ||
                  station.weatherCategory === 'drizzle';
                const isClear = station.weatherCategory === 'clear';
                const isStorm = station.weatherCategory === 'thunderstorm';

                return (
                  <button
                    key={`${station.latitude}_${station.longitude}`}
                    onClick={() => handleSelectStation(station)}
                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between group ${
                      isSelected
                        ? 'bg-sky-950/80 border-sky-400 text-sky-100 shadow-md shadow-sky-950'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl flex-shrink-0">{station.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
                          {station.cityName}
                          {isStorm && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-700/50">
                              Tempestade
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {station.weatherStatusPt}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="text-sm font-bold text-slate-100 font-mono">
                        {Math.round(station.temperature)}°C
                      </span>
                      <p className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                        <Cloud className="w-2.5 h-2.5" />
                        {station.cloudCover}%
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
