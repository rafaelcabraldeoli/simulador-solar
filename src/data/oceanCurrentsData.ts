export interface OceanCurrentPoint {
  lat: number;
  lng: number;
}

export interface OceanCurrentRoute {
  id: string;
  name: string;
  shortLabel: string;
  type: 'warm' | 'cold';
  colorHex: string;
  path: OceanCurrentPoint[];
  labelPos: OceanCurrentPoint;
  description: string;
  cloudEffect: string;
}

/**
 * Global Ocean Currents & Atmospheric Cloud Conveyor Routes
 * Faithfully recreating the oceanic routes, warm/cold arrows, and gyres
 * from the Physical World Map (Mapa-Múndi Físico).
 */
export const WORLD_OCEAN_CURRENTS: OceanCurrentRoute[] = [
  // ==========================================
  // 1. ATLÂNTICO NORTE (NORTH ATLANTIC GYRE)
  // ==========================================
  {
    id: 'gulf_stream',
    name: 'Corrente do Golfo (Gulf Stream)',
    shortLabel: 'CORRENTE DO GOLFO',
    type: 'warm',
    colorHex: '#ef4444',
    path: [
      { lat: 22, lng: -85 },
      { lat: 26, lng: -80 },
      { lat: 33, lng: -76 },
      { lat: 38, lng: -65 },
      { lat: 42, lng: -50 },
      { lat: 48, lng: -35 },
    ],
    labelPos: { lat: 36, lng: -68 },
    description: 'Corrente quente veloz que transporta água equatorial aquecida do Caribe e da Flórida para o Atlântico Norte.',
    cloudEffect: 'Gera abundante evaporação, bandas frontais de Cumulus e alimenta tempestades do Atlântico.',
  },
  {
    id: 'north_atlantic_drift',
    name: 'Corrente do Atlântico Norte',
    shortLabel: 'CORR. DO ATLÂNTICO NORTE',
    type: 'warm',
    colorHex: '#f87171',
    path: [
      { lat: 48, lng: -35 },
      { lat: 53, lng: -22 },
      { lat: 58, lng: -10 },
      { lat: 63, lng: 5 },
      { lat: 67, lng: 16 },
    ],
    labelPos: { lat: 56, lng: -15 },
    description: 'Extensão da Corrente do Golfo que aquece as Ilhas Britânicas, Escandinávia e Europa Ocidental.',
    cloudEffect: 'Condensa em extensos lençóis de Stratocumulus e Altostratus temperados.',
  },
  {
    id: 'canaries_current',
    name: 'Corrente das Canárias',
    shortLabel: 'CORRENTE DAS CANÁRIAS',
    type: 'cold',
    colorHex: '#38bdf8',
    path: [
      { lat: 44, lng: -14 },
      { lat: 36, lng: -15 },
      { lat: 28, lng: -18 },
      { lat: 18, lng: -22 },
      { lat: 12, lng: -30 },
    ],
    labelPos: { lat: 27, lng: -22 },
    description: 'Corrente fria de retorno que flui para o sul ao longo de Portugal, Espanha e Noroeste da África.',
    cloudEffect: 'Estabiliza a atmosfera marinha, gerando névoas costeiras e campos de Stratocumulus baixos.',
  },
  {
    id: 'north_equatorial_atlantic',
    name: 'Corrente Equatorial Norte (Atlântico)',
    shortLabel: 'CORR. EQUATORIAL NORTE',
    type: 'warm',
    colorHex: '#fb7185',
    path: [
      { lat: 14, lng: -25 },
      { lat: 15, lng: -40 },
      { lat: 15, lng: -55 },
      { lat: 16, lng: -65 },
    ],
    labelPos: { lat: 16, lng: -45 },
    description: 'Flui para oeste impulsionada pelos ventos alísios do nordeste em direção ao Mar do Caribe.',
    cloudEffect: 'Ruas alinhadas de pequenos Cumulus (Trade Wind Cumulus) em rápida progressão para oeste.',
  },

  // ==========================================
  // 2. ATLÂNTICO SUL (SOUTH ATLANTIC GYRE)
  // ==========================================
  {
    id: 'brazil_current',
    name: 'Corrente do Brasil',
    shortLabel: 'CORRENTE DO BRASIL',
    type: 'warm',
    colorHex: '#ef4444',
    path: [
      { lat: -8, lng: -34 },
      { lat: -15, lng: -37 },
      { lat: -23, lng: -41 },
      { lat: -32, lng: -49 },
      { lat: -38, lng: -54 },
    ],
    labelPos: { lat: -22, lng: -36 },
    description: 'Corrente quente tropical que desce ao longo de toda a costa oriental do Brasil até o Rio da Prata.',
    cloudEffect: 'Ar quente e úmido que alimenta chuvas de verão e convecção costeira atlântica.',
  },
  {
    id: 'benguela_current',
    name: 'Corrente de Benguela',
    shortLabel: 'CORRENTE DE BENGUELA',
    type: 'cold',
    colorHex: '#0284c7',
    path: [
      { lat: -36, lng: 16 },
      { lat: -28, lng: 12 },
      { lat: -20, lng: 9 },
      { lat: -12, lng: 7 },
      { lat: -4, lng: 4 },
    ],
    labelPos: { lat: -24, lng: 6 },
    description: 'Corrente fria e rica em nutrientes que sobe pela costa da África do Sul, Namíbia e Angola.',
    cloudEffect: 'Forma vastos lençóis de Stratocumulus marinho e mantém o Deserto da Namíbia hiperárido.',
  },
  {
    id: 'south_equatorial_atlantic',
    name: 'Corrente Equatorial Sul (Atlântico)',
    shortLabel: 'CORR. EQUATORIAL SUL',
    type: 'warm',
    colorHex: '#f87171',
    path: [
      { lat: -4, lng: 5 },
      { lat: -3, lng: -10 },
      { lat: -4, lng: -25 },
      { lat: -5, lng: -34 },
    ],
    labelPos: { lat: -2, lng: -15 },
    description: 'Poderoso fluxo quente empurrado para oeste em direção ao litoral do Nordeste brasileiro.',
    cloudEffect: 'Células convectivas da Zona de Convergência Intertropical (ZCIT).',
  },

  // ==========================================
  // 3. PACÍFICO NORTE (NORTH PACIFIC GYRE)
  // ==========================================
  {
    id: 'kuroshio_current',
    name: 'Corrente de Kuroshio (Japão)',
    shortLabel: 'CORRENTE DE KUROSHIO',
    type: 'warm',
    colorHex: '#ef4444',
    path: [
      { lat: 18, lng: 124 },
      { lat: 25, lng: 127 },
      { lat: 32, lng: 135 },
      { lat: 36, lng: 143 },
      { lat: 39, lng: 155 },
    ],
    labelPos: { lat: 29, lng: 133 },
    description: 'A "Corrente Negra", análogo pacífico da Corrente do Golfo, rica e quente ao longo do Japão.',
    cloudEffect: 'Altíssima evaporação e esteiras de nuvens cumuliformes em direção ao Pacífico Norte.',
  },
  {
    id: 'oyashio_current',
    name: 'Corrente de Oyashio',
    shortLabel: 'CORRENTE DE OYASHIO',
    type: 'cold',
    colorHex: '#0284c7',
    path: [
      { lat: 55, lng: 165 },
      { lat: 48, lng: 155 },
      { lat: 42, lng: 147 },
    ],
    labelPos: { lat: 47, lng: 153 },
    description: 'Corrente subártica extremamente fria originária do Mar de Bering descendo pelas Curilas.',
    cloudEffect: 'Nevoeiros densos persistentes e nuvens baixas Stratus no encontro térmico com Kuroshio.',
  },
  {
    id: 'north_pacific_current',
    name: 'Corrente do Pacífico Norte',
    shortLabel: 'CORR. DO PACÍFICO NORTE',
    type: 'warm',
    colorHex: '#f87171',
    path: [
      { lat: 39, lng: 155 },
      { lat: 43, lng: 175 },
      { lat: 44, lng: -165 },
      { lat: 43, lng: -140 },
    ],
    labelPos: { lat: 43, lng: -175 },
    description: 'Largo fluxo zonal que cruza o Pacífico Norte rumo à América do Norte.',
    cloudEffect: 'Bandas onduladas de Altocumulus e Cirrostratus guiadas pelas frentes extratropicais.',
  },
  {
    id: 'california_current',
    name: 'Corrente da Califórnia',
    shortLabel: 'CORRENTE DA CALIFÓRNIA',
    type: 'cold',
    colorHex: '#38bdf8',
    path: [
      { lat: 45, lng: -127 },
      { lat: 37, lng: -125 },
      { lat: 30, lng: -121 },
      { lat: 23, lng: -115 },
      { lat: 16, lng: -110 },
    ],
    labelPos: { lat: 33, lng: -123 },
    description: 'Corrente fria que desce ao largo da Califórnia e Baixa Califórnia, famosa pela ressurgência marinha.',
    cloudEffect: 'Berço dos famosos VÓRTICES CICLÔNICOS de Stratocumulus e nevoeiros marítimos (Marine Layer).',
  },
  {
    id: 'north_equatorial_pacific',
    name: 'Corrente Equatorial Norte (Pacífico)',
    shortLabel: 'CORR. EQUATORIAL NORTE',
    type: 'warm',
    colorHex: '#fb7185',
    path: [
      { lat: 14, lng: -110 },
      { lat: 13, lng: -145 },
      { lat: 12, lng: -180 },
      { lat: 13, lng: 150 },
      { lat: 14, lng: 130 },
    ],
    labelPos: { lat: 14, lng: -150 },
    description: 'Imenso cinturão de águas quentes que cruza toda a bacia pacífica em direção à Ásia.',
    cloudEffect: 'Fileiras regulares de Cumulus de bom tempo e aglomerados tropicais.',
  },

  // ==========================================
  // 4. PACÍFICO SUL (SOUTH PACIFIC GYRE)
  // ==========================================
  {
    id: 'humboldt_current',
    name: 'Corrente de Humboldt (Peru)',
    shortLabel: 'CORRENTE DE HUMBOLDT (PERU)',
    type: 'cold',
    colorHex: '#0284c7',
    path: [
      { lat: -45, lng: -76 },
      { lat: -35, lng: -74 },
      { lat: -24, lng: -72 },
      { lat: -15, lng: -77 },
      { lat: -5, lng: -83 },
    ],
    labelPos: { lat: -26, lng: -77 },
    description: 'Poderosa corrente fria polar que viaja para o norte colada aos Andes chilenos e peruanos.',
    cloudEffect: 'Imensos campos de Stratocumulus marítimos celulares e orvalho costeiro (Camanchaca).',
  },
  {
    id: 'south_equatorial_pacific',
    name: 'Corrente Equatorial Sul (Pacífico)',
    shortLabel: 'CORR. EQUATORIAL SUL',
    type: 'warm',
    colorHex: '#f87171',
    path: [
      { lat: -5, lng: -85 },
      { lat: -4, lng: -120 },
      { lat: -3, lng: -160 },
      { lat: -4, lng: 170 },
      { lat: -6, lng: 150 },
    ],
    labelPos: { lat: -5, lng: -135 },
    description: 'O maior transporte oceânico quente do mundo, alimentando a "piscina quente" da Micronésia.',
    cloudEffect: 'Poderosas torres de tempestade convectivas e esteiras de nuvens equatoriais.',
  },
  {
    id: 'east_australia_current',
    name: 'Corrente da Austrália Oriental',
    shortLabel: 'CORR. AUSTRÁLIA ORIENTAL',
    type: 'warm',
    colorHex: '#ef4444',
    path: [
      { lat: -16, lng: 150 },
      { lat: -24, lng: 154 },
      { lat: -32, lng: 155 },
      { lat: -39, lng: 152 },
    ],
    labelPos: { lat: -27, lng: 157 },
    description: 'Corrente quente que desce pela Grande Barreira de Coral em direção a Sydney e Tasmânia.',
    cloudEffect: 'Nuvens Cumulus fragmentadas e linhas de instabilidade sobre a costa leste australiana.',
  },

  // ==========================================
  // 5. OCEANO ÍNDICO (INDIAN OCEAN GYRE)
  // ==========================================
  {
    id: 'agulhas_current',
    name: 'Corrente das Agulhas',
    shortLabel: 'CORRENTE DAS AGULHAS',
    type: 'warm',
    colorHex: '#ef4444',
    path: [
      { lat: -15, lng: 42 },
      { lat: -24, lng: 37 },
      { lat: -31, lng: 31 },
      { lat: -36, lng: 24 },
    ],
    labelPos: { lat: -26, lng: 36 },
    description: 'Corrente de contorno ocidental quente e turbulenta no Canal de Moçambique rumo ao Cabo.',
    cloudEffect: 'Ondas marinhas gigantes e convecção intensa quando encontra os ventos frios do sul.',
  },
  {
    id: 'west_australia_current',
    name: 'Corrente da Austrália Ocidental',
    shortLabel: 'CORR. AUSTRÁLIA OCIDENTAL',
    type: 'cold',
    colorHex: '#38bdf8',
    path: [
      { lat: -36, lng: 114 },
      { lat: -28, lng: 112 },
      { lat: -20, lng: 110 },
    ],
    labelPos: { lat: -29, lng: 110 },
    description: 'Corrente fria que viaja para o norte pela costa oeste desértica da Austrália.',
    cloudEffect: 'Campos celulares de Stratocumulus marinho e tempo seco no interior continental.',
  },

  // ==========================================
  // 6. OCEANO AUSTRAL / PERÍMETRO ANTÁRTICO
  // ==========================================
  {
    id: 'antarctic_circumpolar_1',
    name: 'Corrente Circumpolar Antártica (Setor Atlântico)',
    shortLabel: 'CORR. CIRCUMPOLAR ANTÁRTICA',
    type: 'cold',
    colorHex: '#0284c7',
    path: [
      { lat: -56, lng: -65 },
      { lat: -54, lng: -40 },
      { lat: -52, lng: -10 },
      { lat: -51, lng: 20 },
      { lat: -53, lng: 50 },
    ],
    labelPos: { lat: -53, lng: -5 },
    description: 'A maior corrente oceânica do planeta ("Deriva do Vento Oeste"), circundando todo o perímetro.',
    cloudEffect: 'Eterno cinturão tempestuoso de frentes polares, Nimbostratus e ventos uivantes.',
  },
  {
    id: 'antarctic_circumpolar_2',
    name: 'Corrente Circumpolar Antártica (Setor Pacífico)',
    shortLabel: 'CORR. CIRCUMPOLAR ANTÁRTICA',
    type: 'cold',
    colorHex: '#0284c7',
    path: [
      { lat: -53, lng: 80 },
      { lat: -54, lng: 120 },
      { lat: -55, lng: 160 },
      { lat: -56, lng: -160 },
      { lat: -57, lng: -110 },
      { lat: -56, lng: -65 },
    ],
    labelPos: { lat: -56, lng: -130 },
    description: 'Circulação contínua e sem barreiras terrestres no hemisfério sul, conectando os três oceanos.',
    cloudEffect: 'Anel contínuo de nuvens baixas e médias que viajam em alta velocidade em torno da cúpula polar.',
  },
];
