export interface EclipseEvent {
  id: string;
  name: string;
  shortName: string;
  type: 'solar' | 'lunar';
  category: 'future' | 'past';
  date: Date;
  dateFormatted: string;
  timeFormatted: string;
  timezone: string;
  locationName: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
  totalityDuration: string;
  description: string;
  historicalSignificance?: string;
  biome?: 'field' | 'mountain' | 'tropical' | 'andes' | 'forest' | 'beach' | 'city';
}

export const ECLIPSE_CATALOG: EclipseEvent[] = [
  // --- ECLIPSES SOLARES TOTAIS & ANULARES FUTUROS ---
  {
    id: 'solar-2026-spain-norway',
    name: 'Eclipse Solar Total de 2026 (Espanha / Islândia / Groenlândia)',
    shortName: 'Solar Total 2026 (Espanha / Islândia)',
    type: 'solar',
    category: 'future',
    date: new Date(Date.UTC(2026, 7, 12, 17, 47)), // 12 de Agosto de 2026, 17:47 UTC (19:47 CEST Espanha / 14:47 BRT)
    dateFormatted: '12/08/2026',
    timeFormatted: '17:47 UTC (19:47 Local Espanha)',
    timezone: 'CEST (UTC+2)',
    locationName: 'A Coruña, Galícia, Espanha',
    country: 'Espanha / Noruega Ártica',
    flag: '🇪🇸',
    lat: 43.3623,
    lng: -8.4115,
    totalityDuration: '2m 18s',
    biome: 'mountain',
    description: 'O grande eclipse solar total na Europa ocidental e no Ártico. A totalidade cruza a Groenlândia, Islândia e o norte da Espanha durante o entardecer.',
    historicalSignificance: 'Primeiro eclipse solar total visível na Europa continental desde 1999.',
  },
  {
    id: 'solar-2026-antarctica',
    name: 'Eclipse Solar Anular de 2026 (Antártida / Borda de Gelo)',
    shortName: 'Solar Anular 2026 (Antártida)',
    type: 'solar',
    category: 'future',
    date: new Date(Date.UTC(2026, 1, 17, 12, 13)), // 17 de Fevereiro de 2026, 12:13 UTC
    dateFormatted: '17/02/2026',
    timeFormatted: '12:13 UTC',
    timezone: 'UTC',
    locationName: 'Costa da Princesa Elizabeth, Antártida',
    country: 'Antártida',
    flag: '❄️',
    lat: -64.7,
    lng: 86.8,
    totalityDuration: '2m 20s',
    biome: 'mountain',
    description: 'Eclipse anular com o anel de fogo projetando sua sombra circular sobre o manto de gelo antártico.',
  },
  {
    id: 'solar-2027-egypt-luxor',
    name: 'Eclipse Solar Total de 2027 • "O Eclipse do Século" (Luxor, Egito)',
    shortName: 'Solar Total 2027 (Luxor, Egito)',
    type: 'solar',
    category: 'future',
    date: new Date(Date.UTC(2027, 7, 2, 10, 7)), // 02 de Agosto de 2027, 10:07 UTC (12:07 / 13:07 local)
    dateFormatted: '02/08/2027',
    timeFormatted: '10:07 UTC (12:07 Local)',
    timezone: 'EEST (UTC+3)',
    locationName: 'Luxor / Vale dos Reis, Egito',
    country: 'Egito',
    flag: '🇪🇬',
    lat: 25.6872,
    lng: 32.6396,
    totalityDuration: '6m 23s',
    biome: 'mountain',
    description: 'O mais longo eclipse solar total em terra do século XXI. O Sol será completamente bloqueado pela Lua por mais de 6 minutos no zênite do deserto egípcio.',
    historicalSignificance: 'Duração recorde de escuridão total com céu perfeitamente límpido sobre as pirâmides e templos faraônicos.',
  },
  {
    id: 'solar-2028-australia-sydney',
    name: 'Eclipse Solar Total de 2028 (Sydney, Austrália)',
    shortName: 'Solar Total 2028 (Sydney, Austrália)',
    type: 'solar',
    category: 'future',
    date: new Date(Date.UTC(2028, 6, 22, 2, 56)), // 22 de Julho de 2028, 02:56 UTC (12:56 local Sydney)
    dateFormatted: '22/07/2028',
    timeFormatted: '02:56 UTC (12:56 Local)',
    timezone: 'AEST (UTC+10)',
    locationName: 'Sydney (Opera House), Austrália',
    country: 'Austrália',
    flag: '🇦🇺',
    lat: -33.8688,
    lng: 151.2093,
    totalityDuration: '3m 45s',
    biome: 'beach',
    description: 'A faixa de totalidade passa diretamente pelo porto de Sydney, escurecendo a baía em pleno início da tarde australiana.',
  },
  {
    id: 'solar-2030-south-africa',
    name: 'Eclipse Solar Total de 2030 (Durban, África do Sul)',
    shortName: 'Solar Total 2030 (África do Sul)',
    type: 'solar',
    category: 'future',
    date: new Date(Date.UTC(2030, 10, 25, 6, 51)), // 25 de Novembro de 2030, 06:51 UTC (08:51 local)
    dateFormatted: '25/11/2030',
    timeFormatted: '06:51 UTC (08:51 Local)',
    timezone: 'SAST (UTC+2)',
    locationName: 'Durban, África do Sul',
    country: 'África do Sul',
    flag: '🇿🇦',
    lat: -29.8587,
    lng: 31.0218,
    totalityDuration: '3m 44s',
    biome: 'tropical',
    description: 'Totalidade matutina cruzando a Namíbia, África do Sul e o Oceano Índico em direção à Austrália.',
  },

  // --- LUAS DE SANGUE / ECLIPSES LUNARES TOTAIS FUTUROS & RECENTES (EXCLUSIVAMENTE NOTURNOS) ---
  {
    id: 'lunar-2025-brasil-night',
    name: 'Lua de Sangue Total de 2025 (Brasil • Céu Noturno Estrelado)',
    shortName: 'Lua de Sangue 2025 (Brasil • Noite)',
    type: 'lunar',
    category: 'future',
    date: new Date(Date.UTC(2025, 2, 14, 6, 59)), // 14 de Março de 2025, 06:59 UTC (03:59 BRT madrugada)
    dateFormatted: '14/03/2025',
    timeFormatted: '06:59 UTC (03:59 Madrugada Brasil)',
    timezone: 'BRT (UTC-3)',
    locationName: 'Chapada dos Veadeiros / Brasília, Brasil',
    country: 'Brasil / Américas',
    flag: '🇧🇷',
    lat: -14.1333,
    lng: -47.5167,
    totalityDuration: '1h 05m',
    biome: 'tropical',
    description: 'Eclipse total da Lua em plena madrugada brasileira. O céu fica completamente escuro e estrelado, com a Lua de Sangue no alto da abóbada celeste brilhando em tom vermelho-cobre incandescente.',
    historicalSignificance: 'Observação privilegiada no céu noturno límpido das terras altas brasileiras.',
  },
  {
    id: 'lunar-2025-cairo-egypt',
    name: 'Lua de Sangue Total de 2025 (Egito / Gizé • Céu Noturno)',
    shortName: 'Lua de Sangue 2025 (Egito • Noite)',
    type: 'lunar',
    category: 'future',
    date: new Date(Date.UTC(2025, 8, 7, 18, 12)), // 07 de Setembro de 2025, 18:12 UTC (21:12 local Cairo)
    dateFormatted: '07/09/2025',
    timeFormatted: '18:12 UTC (21:12 Noite Gizé)',
    timezone: 'EEST (UTC+3)',
    locationName: 'Pirâmides de Gizé / Cairo, Egito',
    country: 'Egito / Oriente Médio / Europa',
    flag: '🇪🇬',
    lat: 29.9792,
    lng: 31.1342,
    totalityDuration: '1h 22m',
    biome: 'mountain',
    description: 'Uma das mais longas Luas de Sangue da década (82 minutos de totalidade). O céu noturno do deserto fica límpido e repleto de estrelas com a Lua no zênite em tom vermelho-sangue rubi.',
    historicalSignificance: 'Totalidade excepcional de 82 minutos observada em noite escura e estrelada.',
  },
  {
    id: 'lunar-2026-americas-pacific',
    name: 'Lua de Sangue Total de 2026 (Atacama / Chile • Noite Estrelada)',
    shortName: 'Lua de Sangue 2026 (Atacama / Chile)',
    type: 'lunar',
    category: 'future',
    date: new Date(Date.UTC(2026, 2, 3, 11, 34)), // 03 de Março de 2026, 11:34 UTC
    dateFormatted: '03/03/2026',
    timeFormatted: '11:34 UTC (08:34 CLT Chile)',
    timezone: 'CLT (UTC-3)',
    locationName: 'Deserto do Atacama, Chile',
    country: 'Chile / Américas',
    flag: '🇨🇱',
    lat: -24.6272,
    lng: -70.4042,
    totalityDuration: '58m',
    biome: 'andes',
    description: 'A Lua Cheia mergulha na umbra tingindo-se de vermelho-sangue rubi sobre as montanhas dos Andes no céu noturno mais límpido do planeta.',
  },
  {
    id: 'lunar-2026-partial-aug',
    name: 'Eclipse Lunar Parcial de 2026 (Américas / Europa / África)',
    shortName: 'Lunar Parcial 2026',
    type: 'lunar',
    category: 'future',
    date: new Date(Date.UTC(2026, 7, 28, 4, 14)), // 28 de Agosto de 2026, 04:14 UTC
    dateFormatted: '28/08/2026',
    timeFormatted: '04:14 UTC (01:14 BRT)',
    timezone: 'BRT (UTC-3)',
    locationName: 'Oceano Atlântico / Américas',
    country: 'Brasil / Atlântico',
    flag: '🌎',
    lat: -12.0,
    lng: -38.5,
    totalityDuration: '3h 18m',
    biome: 'beach',
    description: 'Eclipse lunar com mordida escura na face sul da Lua visível na madrugada atlântica.',
  },
  {
    id: 'lunar-2029-blood-moon',
    name: 'Super Lua de Sangue Total de 2029 (Rio de Janeiro, Brasil)',
    shortName: 'Super Lua de Sangue 2029 (Brasil • Noite)',
    type: 'lunar',
    category: 'future',
    date: new Date(Date.UTC(2029, 5, 26, 3, 23)), // 26 de Junho de 2029, 03:23 UTC (00:23 BRT meia-noite)
    dateFormatted: '26/06/2029',
    timeFormatted: '03:23 UTC (00:23 BRT Meia-Noite)',
    timezone: 'BRT (UTC-3)',
    locationName: 'Rio de Janeiro / Arpoador, Brasil',
    country: 'Brasil / Atlântico',
    flag: '🇧🇷',
    lat: -22.9068,
    lng: -43.1729,
    totalityDuration: '1h 42m',
    biome: 'beach',
    description: 'Super Lua de Sangue de extraordinária duração (102 minutos de totalidade) na calada da meia-noite cobrindo todo o Atlântico Sul e América do Sul.',
  },

  // --- ECLIPSES HISTÓRICOS EMBLEMÁTICOS DO PASSADO ---
  {
    id: 'solar-2024-great-north-america',
    name: 'Grande Eclipse Solar da América do Norte de 2024 (Texas / México / EUA)',
    shortName: 'Grande Solar 2024 (Texas / México)',
    type: 'solar',
    category: 'past',
    date: new Date(Date.UTC(2024, 3, 8, 18, 18)), // 08 de Abril de 2024, 18:18 UTC (13:18 local Texas)
    dateFormatted: '08/04/2024',
    timeFormatted: '18:18 UTC (13:18 Local)',
    timezone: 'CDT (UTC-5)',
    locationName: 'Dallas / Fort Worth, Texas, EUA',
    country: 'Estados Unidos / México',
    flag: '🇺🇸',
    lat: 32.7767,
    lng: -96.7970,
    totalityDuration: '4m 28s',
    biome: 'field',
    description: 'O famoso eclipse norte-americano de 2024. Escuridão total de quase 4 minutos e meio em pleno dia com coroa solar e proeminências rosadas.',
    historicalSignificance: 'Milhões de pessoas testemunharam o anel de diamante e a coroa solar branca ao redor da silhueta da Lua.',
  },
  {
    id: 'solar-2015-svalbard-norway',
    name: 'Eclipse Solar Total no Ártico de 2015 (Svalbard, Noruega)',
    shortName: 'Solar Ártico 2015 (Svalbard, Noruega)',
    type: 'solar',
    category: 'past',
    date: new Date(Date.UTC(2015, 2, 20, 9, 46)), // 20 de Março de 2015, 09:46 UTC (10:46 local)
    dateFormatted: '20/03/2015',
    timeFormatted: '09:46 UTC (10:46 Local)',
    timezone: 'CET (UTC+1)',
    locationName: 'Longyearbyen, Svalbard, Noruega',
    country: 'Noruega',
    flag: '🇳🇴',
    lat: 78.2232,
    lng: 15.6267,
    totalityDuration: '2m 27s',
    biome: 'mountain',
    description: 'Eclipse total lendário sobre as montanhas nevadas e fiordes congelados de Svalbard na Noruega no dia do Equinócio.',
    historicalSignificance: 'Cenário ártico com 360 graus de crepúsculo dourado sobre a neve polar norueguesa.',
  },
  {
    id: 'solar-1994-brazil-foz',
    name: 'Eclipse Solar Total de 1994 no Brasil (Foz do Iguaçu / Criciúma)',
    shortName: 'Solar Histórico 1994 (Brasil)',
    type: 'solar',
    category: 'past',
    date: new Date(Date.UTC(1994, 10, 3, 13, 40)), // 03 de Novembro de 1994, 13:40 UTC (10:40 local)
    dateFormatted: '03/11/1994',
    timeFormatted: '13:40 UTC (10:40 Local)',
    timezone: 'BRT (UTC-3)',
    locationName: 'Foz do Iguaçu / Criciúma, Brasil',
    country: 'Brasil',
    flag: '🇧🇷',
    lat: -25.5163,
    lng: -54.5854,
    totalityDuration: '4m 23s',
    biome: 'tropical',
    description: 'O mais célebre eclipse solar total histórico visto no Brasil, cruzando o Paraná, Santa Catarina e o Rio Grande do Sul.',
    historicalSignificance: 'Dia virou noite com queda repentina de temperatura e visibilidade dos planetas ao meio da manhã.',
  },
  {
    id: 'solar-1919-sobral-einstein',
    name: 'Eclipse de Sobral de 1919 (Sobral, Ceará, Brasil — Relatividade Geral)',
    shortName: 'Eclipse de Sobral 1919 (Brasil)',
    type: 'solar',
    category: 'past',
    date: new Date(Date.UTC(1919, 4, 29, 13, 0)), // 29 de Maio de 1919, 13:00 UTC (10:00 local)
    dateFormatted: '29/05/1919',
    timeFormatted: '13:00 UTC (10:00 Local)',
    timezone: 'BRT (UTC-3)',
    locationName: 'Sobral, Ceará, Brasil',
    country: 'Brasil',
    flag: '🇧🇷',
    lat: -3.6880,
    lng: -40.3497,
    totalityDuration: '5m 13s',
    biome: 'tropical',
    description: 'O lendário eclipse histórico em Sobral no Ceará que comprovou a deflexão gravitacional da luz estelar pelas observações astronômicas da Coroa Solar.',
    historicalSignificance: 'Marco histórico da ciência mundial com mais de 5 minutos de totalidade sob o céu cearense.',
  },
];

/**
 * Checks if a given date falls within the eclipse window of any catalog eclipse event (±4 hours)
 */
export function findMatchingCatalogEclipse(date: Date): EclipseEvent | null {
  const targetTime = date.getTime();
  let bestMatch: EclipseEvent | null = null;
  let minDiffHours = Infinity;

  for (const ev of ECLIPSE_CATALOG) {
    const diffHours = Math.abs(targetTime - ev.date.getTime()) / (1000 * 3600);
    if (diffHours <= 4.0 && diffHours < minDiffHours) {
      minDiffHours = diffHours;
      bestMatch = ev;
    }
  }
  return bestMatch;
}
