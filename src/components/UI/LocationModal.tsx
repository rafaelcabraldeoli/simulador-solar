import React, { useState } from 'react';
import {
  X,
  MapPin,
  Navigation,
  Search,
  Check,
  Globe,
  Crosshair,
  AlertCircle,
  Loader2,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Clock,
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { WORLD_CITIES, findNearestCity, WorldCity } from '../../data/cities';
import { calculateSolarTimes } from '../../utils/astronomy';

export const LocationModal: React.FC = () => {
  const {
    activeSidebarTool,
    setActiveSidebarTool,
    settings,
    updateSettings,
    setDate,
    currentDate,
  } = useSimulationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [gpsMessage, setGpsMessage] = useState<string>('');

  if (activeSidebarTool !== 'location') return null;

  // Calculate current observer solar times
  const currentSolarInfo = calculateSolarTimes(
    settings.observerLat,
    settings.observerLng,
    currentDate
  );

  // Handle Real GPS Geolocation
  const handleGetLiveGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsMessage('Geolocalização GPS não é suportada pelo seu navegador.');
      return;
    }

    setGpsStatus('locating');
    setGpsMessage('Buscando sinal GPS e satélites...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const nearest = findNearestCity(latitude, longitude);

        const locName = nearest
          ? `${nearest.namePt}, ${nearest.countryPt} (GPS ±${Math.round(accuracy)}m)`
          : `GPS (${latitude > 0 ? latitude.toFixed(2) + '° N' : Math.abs(latitude).toFixed(2) + '° S'}, ${
              longitude > 0 ? longitude.toFixed(2) + '° L' : Math.abs(longitude).toFixed(2) + '° O'
            })`;

        updateSettings({
          observerLat: Number(latitude.toFixed(4)),
          observerLng: Number(longitude.toFixed(4)),
          observerLocationName: locName,
        });

        setGpsStatus('success');
        setGpsMessage(`Localização GPS obtida! Precisão: ±${Math.round(accuracy)}m`);
        setTimeout(() => setGpsStatus('idle'), 5000);
      },
      (error) => {
        setGpsStatus('error');
        if (error.code === error.PERMISSION_DENIED) {
          setGpsMessage('Permissão de GPS negada. Permita o acesso à localização no navegador.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGpsMessage('Sinal GPS indisponível no momento.');
        } else {
          setGpsMessage('Tempo limite esgotado ao buscar GPS.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const filteredCities = WORLD_CITIES.filter((city) => {
    const matchesSearch =
      city.namePt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.countryPt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.country.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedRegion === 'all') return matchesSearch;
    if (selectedRegion === 'brasil') return matchesSearch && city.countryPt === 'Brasil';
    if (selectedRegion === 'sul')
      return (
        matchesSearch &&
        [
          'Brasil',
          'Argentina',
          'Chile',
          'Peru',
          'Colômbia',
          'Venezuela',
          'Equador',
          'Bolívia',
          'Paraguai',
          'Uruguai',
        ].includes(city.countryPt)
      );
    if (selectedRegion === 'europa')
      return (
        matchesSearch &&
        [
          'Portugal',
          'Espanha',
          'França',
          'Reino Unido',
          'Irlanda',
          'Itália',
          'Alemanha',
          'Holanda',
          'Bélgica',
          'Áustria',
          'Polônia',
          'Grécia',
          'Rússia',
          'Suécia',
          'Noruega',
          'Dinamarca',
          'Finlândia',
          'Ucrânia',
          'Turquia',
          'Islândia',
        ].includes(city.countryPt)
      );
    if (selectedRegion === 'norte')
      return (
        matchesSearch &&
        ['Estados Unidos', 'Canadá', 'México', 'Cuba'].includes(city.countryPt)
      );
    if (selectedRegion === 'asia')
      return (
        matchesSearch &&
        [
          'Emirados Árabes',
          'Arábia Saudita',
          'Israel',
          'Índia',
          'Tailândia',
          'Singapura',
          'Indonésia',
          'Malásia',
          'Filipinas',
          'China',
          'Coreia do Sul',
          'Japão',
        ].includes(city.countryPt)
      );
    if (selectedRegion === 'africa')
      return (
        matchesSearch &&
        ['Egito', 'Marrocos', 'Senegal', 'Nigéria', 'Quênia', 'Etiópia', 'RD Congo', 'África do Sul'].includes(
          city.countryPt
        )
      );
    return matchesSearch;
  });

  return (
    <div
      id="modal-location"
      className="fixed md:absolute top-14 md:top-16 left-2 sm:left-16 right-2 sm:right-auto z-40 w-auto sm:w-[460px] max-w-[calc(100vw-16px)] max-h-[88vh] flex flex-col bg-slate-950/95 backdrop-blur-2xl border border-sky-500/30 rounded-2xl shadow-2xl shadow-black/80 animate-in fade-in duration-150 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
            <Crosshair className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Localização & Horário Solar das Cidades
            </h3>
            <p className="text-[10px] text-sky-400 font-mono truncate max-w-[260px]">
              {settings.observerLocationName}
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveSidebarTool(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3.5 overflow-y-auto flex-1 scrollbar-thin">
        {/* CURRENT LOCATION SOLAR EPHEMERIS CARD */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-sky-950/40 border border-amber-500/40 shadow-lg shadow-black/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Sun className="w-4 h-4 animate-spin-slow text-amber-400" />
              <span>Efemérides Solares da Posição Atual</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-slate-900/90 text-sky-300 border-sky-500/40">
              {currentSolarInfo.statusLabel}
            </span>
          </div>

          {/* 3 Metric Cards: Nascer, Meio-Dia, Pôr do Sol */}
          <div className="grid grid-cols-3 gap-2 my-2.5">
            <div className="p-2 rounded-xl bg-slate-950/80 border border-amber-500/30 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400 font-semibold mb-0.5">
                <Sunrise className="w-3.5 h-3.5" />
                <span>Nascer</span>
              </div>
              <div className="text-sm font-bold font-mono text-slate-100">
                {currentSolarInfo.sunriseStr}
              </div>
              <div className="text-[9px] text-slate-400">Leste (Az ~90°)</div>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/80 border border-yellow-500/30 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-yellow-400 font-semibold mb-0.5">
                <Sun className="w-3.5 h-3.5" />
                <span>Meio-Dia</span>
              </div>
              <div className="text-sm font-bold font-mono text-slate-100">
                {currentSolarInfo.solarNoonStr}
              </div>
              <div className="text-[9px] text-slate-400">Zênite / Meridiano</div>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/80 border border-orange-500/30 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-orange-400 font-semibold mb-0.5">
                <Sunset className="w-3.5 h-3.5" />
                <span>Pôr do Sol</span>
              </div>
              <div className="text-sm font-bold font-mono text-slate-100">
                {currentSolarInfo.sunsetStr}
              </div>
              <div className="text-[9px] text-slate-400">Oeste (Az ~270°)</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800 mb-3">
            <span>Duração da Luz Solar: <strong className="text-amber-300">{currentSolarInfo.dayLengthStr}</strong></span>
            <span>Declinação Solar: <strong className="text-sky-300">{currentSolarInfo.solarDeclinationDeg}°</strong></span>
          </div>

          {/* Quick Jump Buttons for Current Location */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setDate(currentSolarInfo.sunriseDate)}
              className="py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-xl text-[11px] font-semibold text-amber-200 flex items-center justify-center gap-1 transition shadow-sm"
              title="Ajustar relógio exatamente para o Nascer do Sol nesta posição"
            >
              <Sunrise className="w-3 h-3" />
              <span>Ver Nascer</span>
            </button>

            <button
              onClick={() => setDate(currentSolarInfo.solarNoonDate)}
              className="py-1.5 px-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded-xl text-[11px] font-semibold text-yellow-200 flex items-center justify-center gap-1 transition shadow-sm"
              title="Ajustar relógio exatamente para o Meio-Dia Solar nesta posição"
            >
              <Sun className="w-3 h-3" />
              <span>Ver Meio-Dia</span>
            </button>

            <button
              onClick={() => setDate(currentSolarInfo.sunsetDate)}
              className="py-1.5 px-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-xl text-[11px] font-semibold text-orange-200 flex items-center justify-center gap-1 transition shadow-sm"
              title="Ajustar relógio exatamente para o Pôr do Sol nesta posição"
            >
              <Sunset className="w-3 h-3" />
              <span>Ver Pôr</span>
            </button>
          </div>
        </div>

        {/* 1. Real GPS Geolocation Action Button */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-sky-500/40 shadow-inner">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-white">Sinal GPS em Tempo Real</span>
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5">
                Detecta sua posição exata e coloca o observador na Terra.
              </p>
            </div>

            <button
              onClick={handleGetLiveGps}
              disabled={gpsStatus === 'locating'}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 disabled:bg-sky-800 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/30 transition transform hover:scale-105 active:scale-95"
            >
              {gpsStatus === 'locating' ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Navigation className="w-4 h-4 fill-current" />
              )}
              <span>{gpsStatus === 'locating' ? 'Buscando...' : 'Ligar GPS'}</span>
            </button>
          </div>

          {gpsStatus !== 'idle' && (
            <div
              className={`mt-2.5 p-2 rounded-lg text-[10px] flex items-center gap-2 border ${
                gpsStatus === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : gpsStatus === 'locating'
                  ? 'bg-sky-950/70 border-sky-500/50 text-sky-300'
                  : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
              }`}
            >
              {gpsStatus === 'success' ? (
                <Check className="w-3.5 h-3.5 shrink-0" />
              ) : gpsStatus === 'error' ? (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
              )}
              <span>{gpsMessage}</span>
            </div>
          )}
        </div>

        {/* 2. Search World Cities with Instant Sunrise/Sunset Ephemeris */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              Cidades do Mundo & Horários de Sol
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {filteredCities.length} cidades
            </span>
          </div>

          {/* Search bar */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cidade (ex: São Paulo, Lisboa, Tóquio, Nova York)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          {/* Region Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 mb-2 scrollbar-none">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'brasil', label: 'Brasil' },
              { id: 'sul', label: 'Am. Sul' },
              { id: 'europa', label: 'Europa' },
              { id: 'norte', label: 'Am. Norte' },
              { id: 'asia', label: 'Ásia' },
              { id: 'africa', label: 'África' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedRegion(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition ${
                  selectedRegion === tab.id
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* City List with Sunrise/Sunset details */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {filteredCities.map((city) => {
              const isSelected =
                Math.abs(settings.observerLat - city.lat) < 0.05 &&
                Math.abs(settings.observerLng - city.lng) < 0.05;

              const citySolar = calculateSolarTimes(city.lat, city.lng, currentDate, city.utcOffset);

              return (
                <div
                  key={city.id}
                  className={`w-full p-2.5 rounded-xl border transition flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-sky-950/60 border-sky-400 shadow-md'
                      : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() =>
                        updateSettings({
                          observerLat: city.lat,
                          observerLng: city.lng,
                          observerLocationName: `${city.namePt}, ${city.countryPt}`,
                        })
                      }
                      className="flex items-center gap-2 text-left flex-1"
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isSelected ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'
                        }`}
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                          <span>{city.namePt}</span>
                          {city.isCapital && (
                            <span className="text-[9px] text-amber-400 font-normal">★ Capital</span>
                          )}
                          <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-800 text-slate-400 rounded">
                            {city.timezoneName || `UTC${city.utcOffset >= 0 ? '+' : ''}${city.utcOffset}`}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">{city.countryPt}</span>
                      </div>
                    </button>

                    {/* Solar timings badge */}
                    <div className="text-right font-mono text-[10px]">
                      <div className="text-amber-300 flex items-center justify-end gap-1">
                        <Sunrise className="w-3 h-3 text-amber-400" />
                        <span>{citySolar.sunriseStr}</span>
                        <span className="text-slate-500">|</span>
                        <Sunset className="w-3 h-3 text-orange-400" />
                        <span>{citySolar.sunsetStr}</span>
                      </div>
                      <div className="text-slate-400 text-[9px] mt-0.5">
                        Dia: {citySolar.dayLengthStr}
                      </div>
                    </div>
                  </div>

                  {/* Teleport to City & Sunrise / Sunset Quick Buttons */}
                  <div className="flex items-center gap-1 pt-1 border-t border-slate-800/60">
                    <button
                      onClick={() => {
                        updateSettings({
                          observerLat: city.lat,
                          observerLng: city.lng,
                          observerLocationName: `${city.namePt}, ${city.countryPt}`,
                        });
                      }}
                      className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-sky-900/50 text-[10px] font-medium text-slate-300 hover:text-sky-200 transition text-center"
                    >
                      📍 Teleportar Observador
                    </button>

                    <button
                      onClick={() => {
                        updateSettings({
                          observerLat: city.lat,
                          observerLng: city.lng,
                          observerLocationName: `${city.namePt}, ${city.countryPt}`,
                        });
                        setDate(citySolar.sunriseDate);
                      }}
                      className="py-1 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-semibold flex items-center gap-1 transition"
                      title={`Teleportar para ${city.namePt} e ver o Nascer do Sol às ${citySolar.sunriseStr}`}
                    >
                      <Sunrise className="w-3 h-3" />
                      <span>Nascer ({citySolar.sunriseStr})</span>
                    </button>

                    <button
                      onClick={() => {
                        updateSettings({
                          observerLat: city.lat,
                          observerLng: city.lng,
                          observerLocationName: `${city.namePt}, ${city.countryPt}`,
                        });
                        setDate(citySolar.sunsetDate);
                      }}
                      className="py-1 px-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-[10px] font-semibold flex items-center gap-1 transition"
                      title={`Teleportar para ${city.namePt} e ver o Pôr do Sol às ${citySolar.sunsetStr}`}
                    >
                      <Sunset className="w-3 h-3" />
                      <span>Pôr ({citySolar.sunsetStr})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Manual Coordinate Fine-Tuning */}
        <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Latitude Manual (°)</label>
            <input
              type="number"
              min="-90"
              max="90"
              step="0.01"
              value={settings.observerLat}
              onChange={(e) =>
                updateSettings({
                  observerLat: Number(e.target.value),
                  observerLocationName: `Manual (${Number(e.target.value)}°, ${settings.observerLng}°)`,
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Longitude Manual (°)</label>
            <input
              type="number"
              min="-180"
              max="180"
              step="0.01"
              value={settings.observerLng}
              onChange={(e) =>
                updateSettings({
                  observerLng: Number(e.target.value),
                  observerLocationName: `Manual (${settings.observerLat}°, ${Number(e.target.value)}°)`,
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-slate-200"
            />
          </div>
        </div>

        {/* Double-Click Map Tip */}
        <div className="p-2 bg-sky-950/40 border border-sky-800/40 rounded-xl flex items-center gap-2">
          <span className="text-sm">📍</span>
          <p className="text-[10px] text-sky-200 leading-tight">
            <strong className="text-white">Dica:</strong> Dê um <strong>duplo clique</strong> em qualquer ponto do mapa 3D para posicionar o observador instantaneamente.
          </p>
        </div>
      </div>
    </div>
  );
};
