import { AtmosphereLayerId } from '../types';

export interface KeyAtmosphericObject {
  id: string;
  name: string;
  altitudeKm: number;
  altitudeLabel: string;
  category: 'aircraft' | 'space' | 'meteor' | 'phenomenon' | 'shield';
  description: string;
  iconName: string;
}

export interface AtmosphericLayerData {
  id: AtmosphereLayerId;
  name: string;
  title: string;
  order: number;
  altitudeMinKm: number;
  altitudeMaxKm: number;
  altitudeLabel: string;
  tempRange: string;
  tempCurveStartC: number;
  tempCurveEndC: number;
  colorHex: string;
  glowHex: string;
  accentClass: string;
  borderClass: string;
  bgLightClass: string;
  userDescription: string; // User prompt text
  scientificDescription: string;
  gases: string;
  pressure: string;
  features: string[];
  keyObjects: KeyAtmosphericObject[];
}

export const ATMOSPHERIC_LAYERS: AtmosphericLayerData[] = [
  {
    id: 'troposphere',
    name: 'Troposfera',
    title: 'Troposfera (0 a 10 km)',
    order: 1,
    altitudeMinKm: 0,
    altitudeMaxKm: 10,
    altitudeLabel: '0 km a 10 km',
    tempRange: '+15°C a -55°C',
    tempCurveStartC: 15,
    tempCurveEndC: -55,
    colorHex: '#38bdf8', // Sky blue
    glowHex: '#0284c7',
    accentClass: 'text-sky-400',
    borderClass: 'border-sky-500/40',
    bgLightClass: 'bg-sky-500/10',
    userDescription:
      'É a camada mais próxima da superfície, estendendo-se até cerca de 10 km de altitude. Nela ocorrem os fenômenos meteorológicos (chuva, vento, nuvens) e concentra-se a maior parte do ar que respiramos.',
    scientificDescription:
      'Contém aproximadamente 75% a 80% de toda a massa atmosférica terrestre e 99% do vapor de água. A temperatura cai a uma taxa de aproximadamente 6,5°C a cada 1.000 metros de elevação (gradiente térmico adiabático). É delimitada superiormente pela Tropopausa.',
    gases: '78% Nitrogênio (N₂), 21% Oxigênio (O₂), 0.9% Argônio, vapor de água e CO₂',
    pressure: '1013,25 hPa (ao nível do mar) diminuindo até ~200 hPa',
    features: [
      'Nuvens, chuvas, neve e tempestades convectivas',
      'Ventos superficiais, brisas marítimas e correntes térmicas',
      'Maior concentração de oxigênio vital e massa gasosa',
      'Pico culminante: Monte Everest (8.848 m / 8.8 km)',
      'Balões meteorológicos de baixa altitude',
    ],
    keyObjects: [
      {
        id: 'clouds_weather',
        name: 'Nuvens & Meteorologia',
        altitudeKm: 2,
        altitudeLabel: '0 a 10 km',
        category: 'phenomenon',
        description: 'Cumulus, Stratus, tempestades e todo o ciclo hidrológico',
        iconName: 'CloudRain',
      },
      {
        id: 'everest_peak',
        name: 'Monte Everest',
        altitudeKm: 8.848,
        altitudeLabel: '8.848 m',
        category: 'phenomenon',
        description: 'Teto topográfico do relevo terrestre culminando na troposfera',
        iconName: 'Mountain',
      },
      {
        id: 'weather_balloon',
        name: 'Balão Meteorológico',
        altitudeKm: 6,
        altitudeLabel: '5 a 10 km',
        category: 'aircraft',
        description: 'Sondas de pressão, temperatura e umidade relativa',
        iconName: 'Navigation',
      },
    ],
  },
  {
    id: 'stratosphere',
    name: 'Estratosfera',
    title: 'Estratosfera (10 a 50 km)',
    order: 2,
    altitudeMinKm: 10,
    altitudeMaxKm: 50,
    altitudeLabel: '10 km a 50 km',
    tempRange: '-55°C a 0°C (Inversão Térmica)',
    tempCurveStartC: -55,
    tempCurveEndC: 0,
    colorHex: '#3b82f6', // Sapphire blue
    glowHex: '#2563eb',
    accentClass: 'text-blue-400',
    borderClass: 'border-blue-500/40',
    bgLightClass: 'bg-blue-500/10',
    userDescription:
      'Fica entre 10 km e 50 km de altura. Contém a camada de ozônio, que absorve os raios ultravioleta do Sol. Os aviões comerciais costumam voar aqui para fugir de turbulências.',
    scientificDescription:
      'Caracterizada por estratificação estável do ar (ausência de turbulência convectiva). Ocorre uma inversão térmica: a temperatura sobe de -55°C na base até 0°C no topo (Estratopausa) devido à reação exotérmica de fotodissociação do ozônio que absorve radiação UV solar.',
    gases: 'Nitrogênio, Oxigênio e alta concentração de moléculas de Ozônio (O₃)',
    pressure: '~200 hPa na base caindo para ~1 hPa no topo',
    features: [
      'Camada de Ozônio (Ozonosfera) protetora entre 20 km e 30 km',
      'Voos de aviões comerciais a jato no teto de 10 a 12 km',
      'Ar ultra estável, seco e livre de nuvens de tempestade',
      'Correntes de jato (Jet Streams) em altas velocidades',
      'Balões estratosféricos científicos e saltos de paraquedas extremos (39 km)',
    ],
    keyObjects: [
      {
        id: 'commercial_jet',
        name: 'Aviões Comerciais a Jato',
        altitudeKm: 11,
        altitudeLabel: '10 a 12 km (33.000 - 39.000 pés)',
        category: 'aircraft',
        description: 'Altitude de cruzeiro ideal para economia de combustível e fuga de tempestades',
        iconName: 'Plane',
      },
      {
        id: 'ozone_layer',
        name: 'Camada de Ozônio (O₃)',
        altitudeKm: 25,
        altitudeLabel: '20 a 30 km',
        category: 'shield',
        description: 'Escudo vital fotoquímico que filtra até 98% dos raios ultravioleta UV-B e UV-C do Sol',
        iconName: 'Shield',
      },
      {
        id: 'strato_balloon',
        name: 'Balão Estratosférico',
        altitudeKm: 38,
        altitudeLabel: '30 a 40 km',
        category: 'aircraft',
        description: 'Sondas de observação cósmica e missões extremas na borda do espaço',
        iconName: 'Compass',
      },
    ],
  },
  {
    id: 'mesosphere',
    name: 'Mesosfera',
    title: 'Mesosfera (50 a 85 km)',
    order: 3,
    altitudeMinKm: 50,
    altitudeMaxKm: 85,
    altitudeLabel: '50 km a 85 km',
    tempRange: '0°C a -100°C (Camada Mais Fria)',
    tempCurveStartC: 0,
    tempCurveEndC: -100,
    colorHex: '#818cf8', // Indigo / Cold Violet
    glowHex: '#6366f1',
    accentClass: 'text-indigo-400',
    borderClass: 'border-indigo-500/40',
    bgLightClass: 'bg-indigo-500/10',
    userDescription:
      'Localiza-se entre 50 km e 85 km de altitude. É a camada mais fria, onde os meteoritos se desintegram ao entrar na atmosfera, criando o efeito de "estrelas cadentes".',
    scientificDescription:
      'A temperatura decresce continuamente com a altitude até atingir o ponto mais frio de toda a atmosfera terrestre, cerca de -90°C a -100°C na Mesopausa (85 km). Apesar da baixa densidade, a compressão aerodinâmica do gás desacelera meteoroides que entram a mais de 40.000 km/h, aquecendo-os até a incandescência e vaporização.',
    gases: 'Ar rarefeito composto por Nitrogênio e Oxigênio ionizável',
    pressure: '~1 hPa diminuindo para ~0,01 hPa (quase vácuo)',
    features: [
      'Desintegração de meteoritos gerando o rastro de estrelas cadentes',
      'Camada mais fria do planeta Terra (-100°C)',
      'Nuvens Noctilucentes (nuvens mesosféricas polares de cristais de gelo)',
      'Fenômenos luminosos transitórios (Sprites, Jatos Azuis e Elves)',
      'Limite superior de voo aerodinâmico e aerológico',
    ],
    keyObjects: [
      {
        id: 'shooting_meteors',
        name: 'Estrelas Cadentes (Meteoros)',
        altitudeKm: 75,
        altitudeLabel: '60 a 85 km',
        category: 'meteor',
        description: 'Pedaços de poeira cósmica e rochas espaciais desintegrando-se em rastro incandescente',
        iconName: 'Sparkles',
      },
      {
        id: 'noctilucent_clouds',
        name: 'Nuvens Noctilucentes',
        altitudeKm: 82,
        altitudeLabel: '80 a 85 km',
        category: 'phenomenon',
        description: 'Nuvens mais altas da Terra, visíveis no crepúsculo profundo iluminadas pelo Sol',
        iconName: 'Cloud',
      },
      {
        id: 'sounding_rocket',
        name: 'Foguetes de Sondagem',
        altitudeKm: 65,
        altitudeLabel: '50 a 85 km',
        category: 'space',
        description: 'Veículos suborbitais para medições geofísicas in situ na mesosfera',
        iconName: 'Rocket',
      },
    ],
  },
  {
    id: 'thermosphere',
    name: 'Termosfera',
    title: 'Termosfera (85 a 500 km)',
    order: 4,
    altitudeMinKm: 85,
    altitudeMaxKm: 500,
    altitudeLabel: '85 km a 500 km',
    tempRange: '-100°C até +1.500°C a +2.000°C (Camada Mais Quente)',
    tempCurveStartC: -100,
    tempCurveEndC: 1500,
    colorHex: '#ec4899', // Hot Pink / Neon Magenta
    glowHex: '#db2777',
    accentClass: 'text-pink-400',
    borderClass: 'border-pink-500/40',
    bgLightClass: 'bg-pink-500/10',
    userDescription:
      'Fica entre 85 km e 500 km (ou mais) de altura. É a camada mais quente, onde orbitam a Estação Espacial Internacional e ocorrem as auroras boreais e austrais.',
    scientificDescription:
      'A radiação ultravioleta e raios-X intensos provenientes do Sol são diretamente absorvidos pelas moléculas residuais, acelerando sua energia cinética a temperaturas superiores a 1.500°C. Contém a Ionosfera, região altamente eletricamente carregada essencial para reflexão de ondas de rádio globais e onde ocorrem as Auroras.',
    gases: 'Oxigênio atômico (O), Nitrogênio atômico (N) e Hélio em estado parcialmente ionizado (plasma)',
    pressure: 'Extremamente baixa (< 0,0001 hPa, alto vácuo espacial)',
    features: [
      'Órbita da Estação Espacial Internacional (ISS / EEI a ~400 km)',
      'Auroras Boreais (Polo Norte) e Austrais (Polo Sul) entre 100 e 300 km',
      'Camada mais quente da atmosfera (temperaturas atômicas de até 2000°C)',
      'Linha de Kármán (100 km) demarcando a fronteira internacional do espaço',
      'Satélites de órbita terrestre baixa (LEO, Starlink, telescópios espaciais)',
    ],
    keyObjects: [
      {
        id: 'iss_station',
        name: 'Estação Espacial Internacional (ISS)',
        altitudeKm: 408,
        altitudeLabel: '400 a 420 km',
        category: 'space',
        description: 'Laboratório orbital multinacional orbitando a 27.600 km/h com painéis solares reluzentes',
        iconName: 'Orbit',
      },
      {
        id: 'aurora_lights',
        name: 'Auroras Boreais & Austrais',
        altitudeKm: 150,
        altitudeLabel: '100 a 300 km',
        category: 'phenomenon',
        description: 'Cortinas ondulantes de luz verde e magenta geradas pelo impacto de vento solar na ionosfera',
        iconName: 'Zap',
      },
      {
        id: 'karman_line',
        name: 'Linha de Kármán',
        altitudeKm: 100,
        altitudeLabel: '100 km',
        category: 'shield',
        description: 'Fronteira internacionalmente aceita entre a atmosfera terrestre e o espaço exterior',
        iconName: 'Compass',
      },
    ],
  },
  {
    id: 'exosphere',
    name: 'Exosfera',
    title: 'Exosfera (500 a 10.000 km)',
    order: 5,
    altitudeMinKm: 500,
    altitudeMaxKm: 10000,
    altitudeLabel: '500 km a 10.000 km',
    tempRange: 'Até +1.500°C (Energia Cinética das Moléculas)',
    tempCurveStartC: 1500,
    tempCurveEndC: 25,
    colorHex: '#a855f7', // Deep Cosmic Purple
    glowHex: '#7e22ce',
    accentClass: 'text-purple-400',
    borderClass: 'border-purple-500/40',
    bgLightClass: 'bg-purple-500/10',
    userDescription:
      'É a última camada, situada entre 500 km e 10.000 km de altitude, fazendo a transição direta para o espaço sideral com gases muito rarefeitos (hidrogênio e hélio).',
    scientificDescription:
      'Fronteira superior da atmosfera da Terra onde a densidade do ar é tão infinitesimal que os átomos praticamente não colidem entre si (caminho livre médio de centenas de quilômetros). Átomos velozes superam a velocidade de escape e dissipam-se livremente no vácuo interplanetário através do chamado sopro térmico da geocoroa.',
    gases: 'Quase exclusivamente Hidrogênio (H) e Hélio (He) ultra rarefeitos',
    pressure: 'Praticamente nula (vácuo do espaço cósmico sideral)',
    features: [
      'Transição direta para o vácuo infinito do espaço cósmico',
      'Gases ultra rarefeitos: átomos de Hidrogênio e Hélio em dispersão',
      'Geocoroa terrestre: tênue halo de hidrogênio que brilha em luz UV',
      'Órbita de satélites de média e alta altitude (satélites de navegação GPS)',
      'Ausência de resistência ou arrasto aerodinâmico significativo',
    ],
    keyObjects: [
      {
        id: 'gps_satellite',
        name: 'Satélites de Alta Órbita (GPS/GNSS)',
        altitudeKm: 20200,
        altitudeLabel: '20.200 km',
        category: 'space',
        description: 'Constelações de posicionamento global e satélites geoestacionários a 35.786 km',
        iconName: 'Radio',
      },
      {
        id: 'geocorona_halo',
        name: 'Geocoroa de Hidrogênio & Hélio',
        altitudeKm: 5000,
        altitudeLabel: '500 a 10.000 km',
        category: 'phenomenon',
        description: 'Halo gasoso tênue de átomos neutros fazendo a transição suave para o meio interplanetário',
        iconName: 'Sun',
      },
    ],
  },
];

export function getAtmosphericLayerById(id: AtmosphereLayerId): AtmosphericLayerData | undefined {
  return ATMOSPHERIC_LAYERS.find((layer) => layer.id === id);
}
