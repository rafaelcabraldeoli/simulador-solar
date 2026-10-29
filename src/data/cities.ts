export interface WorldCity {
  id: string;
  name: string;
  namePt: string;
  country: string;
  countryPt: string;
  lat: number;
  lng: number;
  utcOffset: number; // Standard timezone offset from UTC (hours)
  timezoneName?: string;
  isCapital?: boolean;
  importance: 1 | 2 | 3; // 1 = Megacity / Capital, 2 = Major City, 3 = Regional Center
}

export const WORLD_CITIES: WorldCity[] = [
  // --- BRASIL & AMÉRICA DO SUL (TODOS OS PAÍSES E CAPITAIS) ---
  { id: 'brasilia', name: 'Brasília', namePt: 'Brasília', country: 'Brazil', countryPt: 'Brasil', lat: -15.7975, lng: -47.8919, utcOffset: -3, timezoneName: 'BRT (UTC-3)', isCapital: true, importance: 1 },
  { id: 'sao_paulo', name: 'São Paulo', namePt: 'São Paulo', country: 'Brazil', countryPt: 'Brasil', lat: -23.5505, lng: -46.6333, utcOffset: -3, timezoneName: 'BRT (UTC-3)', importance: 1 },
  { id: 'rio_de_janeiro', name: 'Rio de Janeiro', namePt: 'Rio de Janeiro', country: 'Brazil', countryPt: 'Brasil', lat: -22.9068, lng: -43.1729, utcOffset: -3, timezoneName: 'BRT (UTC-3)', importance: 1 },
  { id: 'salvador', name: 'Salvador', namePt: 'Salvador', country: 'Brazil', countryPt: 'Brasil', lat: -12.9714, lng: -38.5014, utcOffset: -3, timezoneName: 'BRT (UTC-3)', importance: 2 },
  { id: 'fortaleza', name: 'Fortaleza', namePt: 'Fortaleza', country: 'Brazil', countryPt: 'Brasil', lat: -3.7319, lng: -38.5267, utcOffset: -3, timezoneName: 'BRT (UTC-3)', importance: 2 },
  { id: 'belo_horizonte', name: 'Belo Horizonte', namePt: 'Belo Horizonte', country: 'Brazil', countryPt: 'Brasil', lat: -19.9217, lng: -43.9345, utcOffset: -3, timezoneName: 'BRT (UTC-3)', importance: 2 },
  { id: 'manaus', name: 'Manaus', namePt: 'Manaus', country: 'Brazil', countryPt: 'Brasil', lat: -3.1190, lng: -60.0217, utcOffset: -4, timezoneName: 'AMT (UTC-4)', importance: 2 },
  { id: 'curitiba', name: 'Curitiba', namePt: 'Curitiba', country: 'Brazil', countryPt: 'Brasil', lat: -25.4284, lng: -49.2733, utcOffset: -3, timezoneName: 'BRT (UTC-3)', importance: 2 },
  { id: 'recife', name: 'Recife', namePt: 'Recife', country: 'Brazil', countryPt: 'Brasil', lat: -8.0476, lng: -34.8770, utcOffset: -3, timezoneName: 'BRT (UTC-3)', importance: 2 },
  { id: 'porto_alegre', name: 'Porto Alegre', namePt: 'Porto Alegre', country: 'Brazil', countryPt: 'Brasil', lat: -30.0346, lng: -51.2177, utcOffset: -3, timezoneName: 'BRT (UTC-3)', importance: 2 },
  { id: 'belem', name: 'Belém', namePt: 'Belém', country: 'Brazil', countryPt: 'Brasil', lat: -1.4558, lng: -48.4902, utcOffset: -3, timezoneName: 'BRT (UTC-3)', importance: 2 },
  { id: 'goiania', name: 'Goiânia', namePt: 'Goiânia', country: 'Brazil', countryPt: 'Brasil', lat: -16.6869, lng: -49.2648, utcOffset: -3, timezoneName: 'BRT (UTC-3)', importance: 2 },
  { id: 'cuiaba', name: 'Cuiabá', namePt: 'Cuiabá', country: 'Brazil', countryPt: 'Brasil', lat: -15.6014, lng: -56.0979, utcOffset: -4, timezoneName: 'AMT (UTC-4)', importance: 2 },
  { id: 'buenos_aires', name: 'Buenos Aires', namePt: 'Buenos Aires', country: 'Argentina', countryPt: 'Argentina', lat: -34.6037, lng: -58.3816, utcOffset: -3, timezoneName: 'ART (UTC-3)', isCapital: true, importance: 1 },
  { id: 'cordoba', name: 'Córdoba', namePt: 'Córdoba', country: 'Argentina', countryPt: 'Argentina', lat: -31.4201, lng: -64.1888, utcOffset: -3, timezoneName: 'ART (UTC-3)', importance: 2 },
  { id: 'mendoza', name: 'Mendoza (Andes)', namePt: 'Mendoza (Andes)', country: 'Argentina', countryPt: 'Argentina', lat: -32.8895, lng: -68.8458, utcOffset: -3, timezoneName: 'ART (UTC-3)', importance: 2 },
  { id: 'santiago', name: 'Santiago', namePt: 'Santiago', country: 'Chile', countryPt: 'Chile', lat: -33.4489, lng: -70.6693, utcOffset: -4, timezoneName: 'CLT (UTC-4)', isCapital: true, importance: 1 },
  { id: 'lima', name: 'Lima', namePt: 'Lima', country: 'Peru', countryPt: 'Peru', lat: -12.0464, lng: -77.0428, utcOffset: -5, timezoneName: 'PET (UTC-5)', isCapital: true, importance: 1 },
  { id: 'cusco', name: 'Cusco (Andes)', namePt: 'Cusco (Andes)', country: 'Peru', countryPt: 'Peru', lat: -13.5319, lng: -71.9675, utcOffset: -5, timezoneName: 'PET (UTC-5)', importance: 2 },
  { id: 'bogota', name: 'Bogotá', namePt: 'Bogotá', country: 'Colombia', countryPt: 'Colômbia', lat: 4.7110, lng: -74.0721, utcOffset: -5, timezoneName: 'COT (UTC-5)', isCapital: true, importance: 1 },
  { id: 'medellin', name: 'Medellín', namePt: 'Medellín', country: 'Colombia', countryPt: 'Colômbia', lat: 6.2442, lng: -75.5812, utcOffset: -5, timezoneName: 'COT (UTC-5)', importance: 2 },
  { id: 'caracas', name: 'Caracas', namePt: 'Caracas', country: 'Venezuela', countryPt: 'Venezuela', lat: 10.4806, lng: -66.9036, utcOffset: -4, timezoneName: 'VET (UTC-4)', isCapital: true, importance: 1 },
  { id: 'quito', name: 'Quito', namePt: 'Quito', country: 'Ecuador', countryPt: 'Equador', lat: -0.1807, lng: -78.4678, utcOffset: -5, timezoneName: 'ECT (UTC-5)', isCapital: true, importance: 1 },
  { id: 'guayaquil', name: 'Guayaquil', namePt: 'Guayaquil', country: 'Ecuador', countryPt: 'Equador', lat: -2.1894, lng: -79.8891, utcOffset: -5, timezoneName: 'ECT (UTC-5)', importance: 2 },
  { id: 'la_paz', name: 'La Paz', namePt: 'La Paz', country: 'Bolivia', countryPt: 'Bolívia', lat: -16.5000, lng: -68.1193, utcOffset: -4, timezoneName: 'BOT (UTC-4)', isCapital: true, importance: 1 },
  { id: 'sucre', name: 'Sucre', namePt: 'Sucre', country: 'Bolivia', countryPt: 'Bolívia', lat: -19.0196, lng: -65.2619, utcOffset: -4, timezoneName: 'BOT (UTC-4)', isCapital: true, importance: 2 },
  { id: 'asuncion', name: 'Asunción', namePt: 'Assunção', country: 'Paraguay', countryPt: 'Paraguai', lat: -25.2637, lng: -57.5759, utcOffset: -4, timezoneName: 'PYT (UTC-4)', isCapital: true, importance: 1 },
  { id: 'montevideo', name: 'Montevideo', namePt: 'Montevidéu', country: 'Uruguay', countryPt: 'Uruguai', lat: -34.9011, lng: -56.1645, utcOffset: -3, timezoneName: 'UYT (UTC-3)', isCapital: true, importance: 1 },
  { id: 'georgetown', name: 'Georgetown', namePt: 'Georgetown', country: 'Guyana', countryPt: 'Guiana', lat: 6.8013, lng: -58.1551, utcOffset: -4, timezoneName: 'GYT (UTC-4)', isCapital: true, importance: 2 },
  { id: 'paramaribo', name: 'Paramaribo', namePt: 'Paramaribo', country: 'Suriname', countryPt: 'Suriname', lat: 5.8520, lng: -55.2038, utcOffset: -3, timezoneName: 'SRT (UTC-3)', isCapital: true, importance: 2 },
  { id: 'cayenne', name: 'Cayenne', namePt: 'Caiena', country: 'French Guiana', countryPt: 'Guiana Francesa', lat: 4.9372, lng: -52.3260, utcOffset: -3, timezoneName: 'GFT (UTC-3)', isCapital: true, importance: 2 },

  // --- AMÉRICA DO NORTE & CENTRAL ---
  { id: 'washington', name: 'Washington D.C.', namePt: 'Washington D.C.', country: 'United States', countryPt: 'Estados Unidos', lat: 38.9072, lng: -77.0369, utcOffset: -5, timezoneName: 'EST (UTC-5)', isCapital: true, importance: 1 },
  { id: 'new_york', name: 'New York', namePt: 'Nova York', country: 'United States', countryPt: 'Estados Unidos', lat: 40.7128, lng: -74.0060, utcOffset: -5, timezoneName: 'EST (UTC-5)', importance: 1 },
  { id: 'los_angeles', name: 'Los Angeles', namePt: 'Los Angeles', country: 'United States', countryPt: 'Estados Unidos', lat: 34.0522, lng: -118.2437, utcOffset: -8, timezoneName: 'PST (UTC-8)', importance: 1 },
  { id: 'chicago', name: 'Chicago', namePt: 'Chicago', country: 'United States', countryPt: 'Estados Unidos', lat: 41.8781, lng: -87.6298, utcOffset: -6, timezoneName: 'CST (UTC-6)', importance: 1 },
  { id: 'miami', name: 'Miami', namePt: 'Miami', country: 'United States', countryPt: 'Estados Unidos', lat: 25.7617, lng: -80.1918, utcOffset: -5, timezoneName: 'EST (UTC-5)', importance: 1 },
  { id: 'houston', name: 'Houston', namePt: 'Houston', country: 'United States', countryPt: 'Estados Unidos', lat: 29.7604, lng: -95.3698, utcOffset: -6, timezoneName: 'CST (UTC-6)', importance: 2 },
  { id: 'san_francisco', name: 'San Francisco', namePt: 'São Francisco', country: 'United States', countryPt: 'Estados Unidos', lat: 37.7749, lng: -122.4194, utcOffset: -8, timezoneName: 'PST (UTC-8)', importance: 1 },
  { id: 'seattle', name: 'Seattle', namePt: 'Seattle', country: 'United States', countryPt: 'Estados Unidos', lat: 47.6062, lng: -122.3321, utcOffset: -8, timezoneName: 'PST (UTC-8)', importance: 2 },
  { id: 'denver', name: 'Denver (Rochosas)', namePt: 'Denver (Rochosas)', country: 'United States', countryPt: 'Estados Unidos', lat: 39.7392, lng: -104.9903, utcOffset: -7, timezoneName: 'MST (UTC-7)', importance: 2 },
  { id: 'ottawa', name: 'Ottawa', namePt: 'Ottawa', country: 'Canada', countryPt: 'Canadá', lat: 45.4215, lng: -75.6972, utcOffset: -5, timezoneName: 'EST (UTC-5)', isCapital: true, importance: 1 },
  { id: 'toronto', name: 'Toronto', namePt: 'Toronto', country: 'Canada', countryPt: 'Canadá', lat: 43.6532, lng: -79.3832, utcOffset: -5, timezoneName: 'EST (UTC-5)', importance: 1 },
  { id: 'vancouver', name: 'Vancouver', namePt: 'Vancouver', country: 'Canada', countryPt: 'Canadá', lat: 49.2827, lng: -123.1207, utcOffset: -8, timezoneName: 'PST (UTC-8)', importance: 2 },
  { id: 'montreal', name: 'Montreal', namePt: 'Montreal', country: 'Canada', countryPt: 'Canadá', lat: 45.5017, lng: -73.5673, utcOffset: -5, timezoneName: 'EST (UTC-5)', importance: 2 },
  { id: 'mexico_city', name: 'Mexico City', namePt: 'Cidade do México', country: 'Mexico', countryPt: 'México', lat: 19.4326, lng: -99.1332, utcOffset: -6, timezoneName: 'CST (UTC-6)', isCapital: true, importance: 1 },
  { id: 'havana', name: 'Havana', namePt: 'Havana', country: 'Cuba', countryPt: 'Cuba', lat: 23.1136, lng: -82.3666, utcOffset: -5, timezoneName: 'CST (UTC-5)', isCapital: true, importance: 2 },
  { id: 'panama_city', name: 'Panama City', namePt: 'Cidade do Panamá', country: 'Panama', countryPt: 'Panamá', lat: 8.9824, lng: -79.5199, utcOffset: -5, timezoneName: 'EST (UTC-5)', isCapital: true, importance: 2 },
  { id: 'san_jose', name: 'San José', namePt: 'San José', country: 'Costa Rica', countryPt: 'Costa Rica', lat: 9.9281, lng: -84.0907, utcOffset: -6, timezoneName: 'CST (UTC-6)', isCapital: true, importance: 2 },
  { id: 'anchorage', name: 'Anchorage', namePt: 'Anchorage (Alasca)', country: 'United States', countryPt: 'Estados Unidos', lat: 61.2181, lng: -149.9003, utcOffset: -9, timezoneName: 'AKST (UTC-9)', importance: 2 },
  { id: 'honolulu', name: 'Honolulu', namePt: 'Honolulu (Havaí)', country: 'United States', countryPt: 'Estados Unidos', lat: 21.3069, lng: -157.8583, utcOffset: -10, timezoneName: 'HST (UTC-10)', importance: 2 },
  { id: 'nuuk', name: 'Nuuk', namePt: 'Nuuk', country: 'Greenland', countryPt: 'Groenlândia', lat: 64.1814, lng: -51.6941, utcOffset: -2, timezoneName: 'WGT (UTC-2)', isCapital: true, importance: 2 },

  // --- EUROPA ---
  { id: 'lisbon', name: 'Lisbon', namePt: 'Lisboa', country: 'Portugal', countryPt: 'Portugal', lat: 38.7223, lng: -9.1393, utcOffset: 0, timezoneName: 'WET (UTC+0)', isCapital: true, importance: 1 },
  { id: 'madrid', name: 'Madrid', namePt: 'Madri', country: 'Spain', countryPt: 'Espanha', lat: 40.4168, lng: -3.7038, utcOffset: 1, timezoneName: 'CET (UTC+1)', isCapital: true, importance: 1 },
  { id: 'barcelona', name: 'Barcelona', namePt: 'Barcelona', country: 'Spain', countryPt: 'Espanha', lat: 41.3851, lng: 2.1734, utcOffset: 1, timezoneName: 'CET (UTC+1)', importance: 2 },
  { id: 'paris', name: 'Paris', namePt: 'Paris', country: 'France', countryPt: 'França', lat: 48.8566, lng: 2.3522, utcOffset: 1, timezoneName: 'CET (UTC+1)', isCapital: true, importance: 1 },
  { id: 'london', name: 'London', namePt: 'Londres', country: 'United Kingdom', countryPt: 'Reino Unido', lat: 51.5074, lng: -0.1278, utcOffset: 0, timezoneName: 'GMT (UTC+0)', isCapital: true, importance: 1 },
  { id: 'dublin', name: 'Dublin', namePt: 'Dublin', country: 'Ireland', countryPt: 'Irlanda', lat: 53.3498, lng: -6.2603, utcOffset: 0, timezoneName: 'GMT (UTC+0)', isCapital: true, importance: 2 },
  { id: 'rome', name: 'Rome', namePt: 'Roma', country: 'Italy', countryPt: 'Itália', lat: 41.9028, lng: 12.4964, utcOffset: 1, timezoneName: 'CET (UTC+1)', isCapital: true, importance: 1 },
  { id: 'berlin', name: 'Berlin', namePt: 'Berlim', country: 'Germany', countryPt: 'Alemanha', lat: 52.5200, lng: 13.4050, utcOffset: 1, timezoneName: 'CET (UTC+1)', isCapital: true, importance: 1 },
  { id: 'amsterdam', name: 'Amsterdam', namePt: 'Amsterdã', country: 'Netherlands', countryPt: 'Holanda', lat: 52.3676, lng: 4.9041, utcOffset: 1, timezoneName: 'CET (UTC+1)', isCapital: true, importance: 1 },
  { id: 'brussels', name: 'Brussels', namePt: 'Bruxelas', country: 'Belgium', countryPt: 'Bélgica', lat: 50.8503, lng: 4.3517, utcOffset: 1, timezoneName: 'CET (UTC+1)', isCapital: true, importance: 2 },
  { id: 'vienna', name: 'Vienna', namePt: 'Viena', country: 'Austria', countryPt: 'Áustria', lat: 48.2082, lng: 16.3738, utcOffset: 1, timezoneName: 'CET (UTC+1)', isCapital: true, importance: 2 },
  { id: 'bern', name: 'Bern (Alpes)', namePt: 'Berna (Alpes)', country: 'Switzerland', countryPt: 'Suíça', lat: 46.9480, lng: 7.4474, utcOffset: 1, timezoneName: 'CET (UTC+1)', isCapital: true, importance: 2 },
  { id: 'warsaw', name: 'Warsaw', namePt: 'Varsóvia', country: 'Poland', countryPt: 'Polônia', lat: 52.2297, lng: 21.0122, utcOffset: 1, timezoneName: 'CET (UTC+1)', isCapital: true, importance: 2 },
  { id: 'athens', name: 'Athens', namePt: 'Atenas', country: 'Greece', countryPt: 'Grécia', lat: 37.9838, lng: 23.7275, utcOffset: 2, timezoneName: 'EET (UTC+2)', isCapital: true, importance: 1 },
  { id: 'moscow', name: 'Moscow', namePt: 'Moscou', country: 'Russia', countryPt: 'Rússia', lat: 55.7558, lng: 37.6173, utcOffset: 3, timezoneName: 'MSK (UTC+3)', isCapital: true, importance: 1 },
  { id: 'st_petersburg', name: 'St. Petersburg', namePt: 'São Petersburgo', country: 'Russia', countryPt: 'Rússia', lat: 59.9343, lng: 30.3351, utcOffset: 3, timezoneName: 'MSK (UTC+3)', importance: 2 },
  { id: 'stockholm', name: 'Stockholm', namePt: 'Estocolmo', country: 'Sweden', countryPt: 'Suécia', lat: 59.3293, lng: 18.0686, utcOffset: 1, timezoneName: 'CET (UTC+1)', isCapital: true, importance: 2 },
  { id: 'oslo', name: 'Oslo', namePt: 'Oslo', country: 'Norway', countryPt: 'Noruega', lat: 59.9139, lng: 10.7522, utcOffset: 1, timezoneName: 'CET (UTC+1)', isCapital: true, importance: 2 },
  { id: 'copenhagen', name: 'Copenhagen', namePt: 'Copenhague', country: 'Denmark', countryPt: 'Dinamarca', lat: 55.6761, lng: 12.5683, utcOffset: 1, timezoneName: 'CET (UTC+1)', isCapital: true, importance: 2 },
  { id: 'helsinki', name: 'Helsinki', namePt: 'Helsinque', country: 'Finland', countryPt: 'Finlândia', lat: 60.1699, lng: 24.9384, utcOffset: 2, timezoneName: 'EET (UTC+2)', isCapital: true, importance: 2 },
  { id: 'kyiv', name: 'Kyiv', namePt: 'Kiev', country: 'Ukraine', countryPt: 'Ucrânia', lat: 50.4501, lng: 30.5234, utcOffset: 2, timezoneName: 'EET (UTC+2)', isCapital: true, importance: 2 },
  { id: 'istanbul', name: 'Istanbul', namePt: 'Istambul', country: 'Turkey', countryPt: 'Turquia', lat: 41.0082, lng: 28.9784, utcOffset: 3, timezoneName: 'TRT (UTC+3)', importance: 1 },
  { id: 'reykjavik', name: 'Reykjavik', namePt: 'Reykjavik', country: 'Iceland', countryPt: 'Islândia', lat: 64.1466, lng: -21.9426, utcOffset: 0, timezoneName: 'GMT (UTC+0)', isCapital: true, importance: 2 },

  // --- ÁFRICA ---
  { id: 'cairo', name: 'Cairo', namePt: 'Cairo', country: 'Egypt', countryPt: 'Egito', lat: 30.0444, lng: 31.2357, utcOffset: 2, timezoneName: 'EET (UTC+2)', isCapital: true, importance: 1 },
  { id: 'casablanca', name: 'Casablanca', namePt: 'Casablanca', country: 'Morocco', countryPt: 'Marrocos', lat: 33.5731, lng: -7.5898, utcOffset: 1, timezoneName: 'WEST (UTC+1)', importance: 2 },
  { id: 'rabat', name: 'Rabat (Atlas)', namePt: 'Rabat (Atlas)', country: 'Morocco', countryPt: 'Marrocos', lat: 34.0209, lng: -6.8416, utcOffset: 1, timezoneName: 'WEST (UTC+1)', isCapital: true, importance: 2 },
  { id: 'dakar', name: 'Dakar', namePt: 'Dacar', country: 'Senegal', countryPt: 'Senegal', lat: 14.6928, lng: -17.4467, utcOffset: 0, timezoneName: 'GMT (UTC+0)', isCapital: true, importance: 2 },
  { id: 'lagos', name: 'Lagos', namePt: 'Lagos', country: 'Nigeria', countryPt: 'Nigéria', lat: 6.5244, lng: 3.3792, utcOffset: 1, timezoneName: 'WAT (UTC+1)', importance: 1 },
  { id: 'abuja', name: 'Abuja', namePt: 'Abuja', country: 'Nigeria', countryPt: 'Nigéria', lat: 9.0765, lng: 7.3986, utcOffset: 1, timezoneName: 'WAT (UTC+1)', isCapital: true, importance: 2 },
  { id: 'nairobi', name: 'Nairobi', namePt: 'Nairóbi', country: 'Kenya', countryPt: 'Quênia', lat: -1.2921, lng: 36.8219, utcOffset: 3, timezoneName: 'EAT (UTC+3)', isCapital: true, importance: 1 },
  { id: 'addis_ababa', name: 'Addis Ababa', namePt: 'Adis Abeba', country: 'Ethiopia', countryPt: 'Etiópia', lat: 9.0320, lng: 38.7480, utcOffset: 3, timezoneName: 'EAT (UTC+3)', isCapital: true, importance: 2 },
  { id: 'kinshasa', name: 'Kinshasa', namePt: 'Kinshasa', country: 'DR Congo', countryPt: 'RD Congo', lat: -4.4419, lng: 15.2663, utcOffset: 1, timezoneName: 'WAT (UTC+1)', isCapital: true, importance: 2 },
  { id: 'luanda', name: 'Luanda', namePt: 'Luanda', country: 'Angola', countryPt: 'Angola', lat: -8.8390, lng: 13.2894, utcOffset: 1, timezoneName: 'WAT (UTC+1)', isCapital: true, importance: 2 },
  { id: 'pretoria', name: 'Pretoria', namePt: 'Pretória', country: 'South Africa', countryPt: 'África do Sul', lat: -25.7479, lng: 28.2293, utcOffset: 2, timezoneName: 'SAST (UTC+2)', isCapital: true, importance: 1 },
  { id: 'johannesburg', name: 'Johannesburg', namePt: 'Joanesburgo', country: 'South Africa', countryPt: 'África do Sul', lat: -26.2041, lng: 28.0473, utcOffset: 2, timezoneName: 'SAST (UTC+2)', importance: 1 },
  { id: 'cape_town', name: 'Cape Town', namePt: 'Cidade do Cabo', country: 'South Africa', countryPt: 'África do Sul', lat: -33.9249, lng: 18.4241, utcOffset: 2, timezoneName: 'SAST (UTC+2)', importance: 1 },
  { id: 'antananarivo', name: 'Antananarivo', namePt: 'Antananarivo', country: 'Madagascar', countryPt: 'Madagascar', lat: -18.8792, lng: 47.5079, utcOffset: 3, timezoneName: 'EAT (UTC+3)', isCapital: true, importance: 2 },

  // --- ÁSIA & ORIENTE MÉDIO ---
  { id: 'beijing', name: 'Beijing', namePt: 'Pequim', country: 'China', countryPt: 'China', lat: 39.9042, lng: 116.4074, utcOffset: 8, timezoneName: 'CST (UTC+8)', isCapital: true, importance: 1 },
  { id: 'shanghai', name: 'Shanghai', namePt: 'Xangai', country: 'China', countryPt: 'China', lat: 31.2304, lng: 121.4737, utcOffset: 8, timezoneName: 'CST (UTC+8)', importance: 1 },
  { id: 'hong_kong', name: 'Hong Kong', namePt: 'Hong Kong', country: 'China', countryPt: 'China', lat: 22.3193, lng: 114.1694, utcOffset: 8, timezoneName: 'HKT (UTC+8)', importance: 1 },
  { id: 'tokyo', name: 'Tokyo', namePt: 'Tóquio', country: 'Japan', countryPt: 'Japão', lat: 35.6762, lng: 139.6503, utcOffset: 9, timezoneName: 'JST (UTC+9)', isCapital: true, importance: 1 },
  { id: 'seoul', name: 'Seoul', namePt: 'Seul', country: 'South Korea', countryPt: 'Coreia do Sul', lat: 37.5665, lng: 126.9780, utcOffset: 9, timezoneName: 'KST (UTC+9)', isCapital: true, importance: 1 },
  { id: 'new_delhi', name: 'New Delhi', namePt: 'Nova Délhi (Himalaias)', country: 'India', countryPt: 'Índia', lat: 28.6139, lng: 77.2090, utcOffset: 5.5, timezoneName: 'IST (UTC+5:30)', isCapital: true, importance: 1 },
  { id: 'mumbai', name: 'Mumbai', namePt: 'Mumbai', country: 'India', countryPt: 'Índia', lat: 19.0760, lng: 72.8777, utcOffset: 5.5, timezoneName: 'IST (UTC+5:30)', importance: 1 },
  { id: 'bangkok', name: 'Bangkok', namePt: 'Bangkok', country: 'Thailand', countryPt: 'Tailândia', lat: 13.7563, lng: 100.5018, utcOffset: 7, timezoneName: 'ICT (UTC+7)', isCapital: true, importance: 1 },
  { id: 'singapore', name: 'Singapore', namePt: 'Singapura', country: 'Singapore', countryPt: 'Singapura', lat: 1.3521, lng: 103.8198, utcOffset: 8, timezoneName: 'SGT (UTC+8)', isCapital: true, importance: 1 },
  { id: 'jakarta', name: 'Jakarta', namePt: 'Jacarta', country: 'Indonesia', countryPt: 'Indonésia', lat: -6.2088, lng: 106.8456, utcOffset: 7, timezoneName: 'WIB (UTC+7)', isCapital: true, importance: 1 },
  { id: 'kuala_lumpur', name: 'Kuala Lumpur', namePt: 'Kuala Lumpur', country: 'Malaysia', countryPt: 'Malásia', lat: 3.1390, lng: 101.6869, utcOffset: 8, timezoneName: 'MYT (UTC+8)', isCapital: true, importance: 2 },
  { id: 'manila', name: 'Manila', namePt: 'Manila', country: 'Philippines', countryPt: 'Filipinas', lat: 14.5995, lng: 120.9842, utcOffset: 8, timezoneName: 'PHT (UTC+8)', isCapital: true, importance: 2 },
  { id: 'hanoi', name: 'Hanoi', namePt: 'Hanói', country: 'Vietnam', countryPt: 'Vietnã', lat: 21.0285, lng: 105.8542, utcOffset: 7, timezoneName: 'ICT (UTC+7)', isCapital: true, importance: 2 },
  { id: 'dubai', name: 'Dubai', namePt: 'Dubai', country: 'United Arab Emirates', countryPt: 'Emirados Árabes', lat: 25.2048, lng: 55.2708, utcOffset: 4, timezoneName: 'GST (UTC+4)', importance: 1 },
  { id: 'riyadh', name: 'Riyadh', namePt: 'Riad', country: 'Saudi Arabia', countryPt: 'Arábia Saudita', lat: 24.7136, lng: 46.6753, utcOffset: 3, timezoneName: 'AST (UTC+3)', isCapital: true, importance: 1 },
  { id: 'jerusalem', name: 'Jerusalem', namePt: 'Jerusalém', country: 'Israel', countryPt: 'Israel', lat: 31.7683, lng: 35.2137, utcOffset: 3, timezoneName: 'IDT (UTC+3)', isCapital: true, importance: 1 },
  { id: 'tehran', name: 'Tehran', namePt: 'Teerã', country: 'Iran', countryPt: 'Irã', lat: 35.6892, lng: 51.3890, utcOffset: 3.5, timezoneName: 'IRST (UTC+3:30)', isCapital: true, importance: 2 },
  { id: 'ankara', name: 'Ankara', namePt: 'Ancara', country: 'Turkey', countryPt: 'Turquia', lat: 39.9334, lng: 32.8597, utcOffset: 3, timezoneName: 'TRT (UTC+3)', isCapital: true, importance: 2 },

  // --- OCEANIA ---
  { id: 'canberra', name: 'Canberra', namePt: 'Camberra', country: 'Australia', countryPt: 'Austrália', lat: -35.2809, lng: 149.1300, utcOffset: 10, timezoneName: 'AEST (UTC+10)', isCapital: true, importance: 1 },
  { id: 'sydney', name: 'Sydney', namePt: 'Sydney', country: 'Australia', countryPt: 'Austrália', lat: -33.8688, lng: 151.2093, utcOffset: 10, timezoneName: 'AEST (UTC+10)', importance: 1 },
  { id: 'melbourne', name: 'Melbourne', namePt: 'Melbourne', country: 'Australia', countryPt: 'Austrália', lat: -37.8136, lng: 144.9631, utcOffset: 10, timezoneName: 'AEST (UTC+10)', importance: 1 },
  { id: 'brisbane', name: 'Brisbane', namePt: 'Brisbane', country: 'Australia', countryPt: 'Austrália', lat: -27.4698, lng: 153.0251, utcOffset: 10, timezoneName: 'AEST (UTC+10)', importance: 2 },
  { id: 'perth', name: 'Perth', namePt: 'Perth', country: 'Australia', countryPt: 'Austrália', lat: -31.9505, lng: 115.8605, utcOffset: 8, timezoneName: 'AWST (UTC+8)', importance: 2 },
  { id: 'wellington', name: 'Wellington', namePt: 'Wellington', country: 'New Zealand', countryPt: 'Nova Zelândia', lat: -41.2865, lng: 174.7762, utcOffset: 12, timezoneName: 'NZST (UTC+12)', isCapital: true, importance: 1 },
  { id: 'auckland', name: 'Auckland', namePt: 'Auckland', country: 'New Zealand', countryPt: 'Nova Zelândia', lat: -36.8485, lng: 174.7633, utcOffset: 12, timezoneName: 'NZST (UTC+12)', importance: 1 },
  { id: 'port_moresby', name: 'Port Moresby', namePt: 'Port Moresby', country: 'Papua New Guinea', countryPt: 'Papua-Nova Guiné', lat: -9.4438, lng: 147.1803, utcOffset: 10, timezoneName: 'PGT (UTC+10)', isCapital: true, importance: 2 },

  // --- GRANDES PICOS & RELEVOS DO MAPA FÍSICO MUNDIAL ---
  { id: 'everest', name: 'Mount Everest (Himalayas - 8,848m)', namePt: 'Monte Everest (Himalaias - 8.848m)', country: 'Nepal / China', countryPt: 'Nepal / China', lat: 27.9881, lng: 86.9250, utcOffset: 5.75, timezoneName: 'NPT (UTC+5:45)', importance: 1 },
  { id: 'aconcagua', name: 'Mount Aconcagua (Andes - 6,960m)', namePt: 'Monte Aconcágua (Andes - 6.960m)', country: 'Argentina', countryPt: 'Argentina', lat: -32.6532, lng: -70.0109, utcOffset: -3, timezoneName: 'ART (UTC-3)', importance: 1 },
  { id: 'denali', name: 'Mount Denali / McKinley (Alaska - 6,194m)', namePt: 'Monte Denali / McKinley (Alasca - 6.194m)', country: 'United States', countryPt: 'Estados Unidos', lat: 63.0692, lng: -151.0070, utcOffset: -9, timezoneName: 'AKST (UTC-9)', importance: 1 },
  { id: 'logan', name: 'Mount Logan (Canada - 6,050m)', namePt: 'Monte Logan (Canadá - 6.050m)', country: 'Canada', countryPt: 'Canadá', lat: 60.5672, lng: -140.4053, utcOffset: -7, timezoneName: 'MST (UTC-7)', importance: 2 },
  { id: 'kilimanjaro', name: 'Mount Kilimanjaro (Tanzania - 5,895m)', namePt: 'Monte Quilimanjaro (Tanzânia - 5.895m)', country: 'Tanzania', countryPt: 'Tanzânia', lat: -3.0674, lng: 37.3556, utcOffset: 3, timezoneName: 'EAT (UTC+3)', importance: 1 },
  { id: 'elbrus', name: 'Mount Elbrus (Caucasus - 5,642m)', namePt: 'Monte Elbrus (Cáucaso - 5.642m)', country: 'Russia', countryPt: 'Rússia', lat: 43.3499, lng: 42.4453, utcOffset: 3, timezoneName: 'MSK (UTC+3)', importance: 1 },
  { id: 'puncak_jaya', name: 'Puncak Jaya / Pico Java (New Guinea - 5,029m)', namePt: 'Puncak Jaya / Pico Java (Nova Guiné - 5.029m)', country: 'Indonesia', countryPt: 'Indonésia', lat: -4.0847, lng: 137.1866, utcOffset: 9, timezoneName: 'WIT (UTC+9)', importance: 2 },
  { id: 'mont_blanc', name: 'Mont Blanc (Alps - 4,807m)', namePt: 'Monte Branco (Alpes - 4.807m)', country: 'France / Italy', countryPt: 'França / Itália', lat: 45.8326, lng: 6.8652, utcOffset: 1, timezoneName: 'CET (UTC+1)', importance: 1 },
  { id: 'kosciuszko', name: 'Mount Kosciuszko (Australia - 2,229m)', namePt: 'Monte Kosciuszko (Austrália - 2.229m)', country: 'Australia', countryPt: 'Austrália', lat: -36.4559, lng: 148.2636, utcOffset: 10, timezoneName: 'AEST (UTC+10)', importance: 2 },
  { id: 'pico_da_neblina', name: 'Pico da Neblina (Brazil - 2,995m)', namePt: 'Pico da Neblina (Brasil - 2.995m)', country: 'Brazil', countryPt: 'Brasil', lat: 0.8039, lng: -66.0042, utcOffset: -4, timezoneName: 'AMT (UTC-4)', importance: 2 },
  { id: 'pico_da_bandeira', name: 'Pico da Bandeira (Serra do Caparaó - 2,892m)', namePt: 'Pico da Bandeira (Serra do Caparaó - 2.892m)', country: 'Brazil', countryPt: 'Brasil', lat: -20.4347, lng: -41.7958, utcOffset: -3, timezoneName: 'BRT (UTC-3)', importance: 2 },
];

/**
 * Finds the nearest world city to given lat/lng (optionally within maxDistanceKm)
 */
export function findNearestCity(lat: number, lng: number, maxDistanceKm = 1800): WorldCity | null {
  let nearest: WorldCity | null = null;
  let minDistanceKm = Infinity;

  WORLD_CITIES.forEach((city) => {
    const dLat = ((city.lat - lat) * Math.PI) / 180;
    const dLng = ((city.lng - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((city.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distKm = 6371 * c;
    if (distKm < minDistanceKm && distKm <= maxDistanceKm) {
      minDistanceKm = distKm;
      nearest = city;
    }
  });

  return nearest;
}

/**
 * Returns the standard UTC offset in hours for a given latitude and longitude.
 */
export function getLocationUtcOffsetHours(lat: number, lng: number): number {
  const nearest = findNearestCity(lat, lng, 1200);
  if (nearest) {
    return nearest.utcOffset;
  }
  return Math.round(lng / 15);
}

/**
 * Formats a numeric UTC offset (e.g. -3, 5.5, 9) into a clean string like "UTC-03:00" or "UTC+05:30".
 */
export function formatUtcOffsetString(utcOffsetHours: number): string {
  const sign = utcOffsetHours >= 0 ? '+' : '-';
  const abs = Math.abs(utcOffsetHours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `UTC${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Computes a Date object representing the exact current local time ("hora atual do lugar")
 * at the given (lat, lng) coordinates right now, so getHours()/getMinutes()/getSeconds()
 * match the real wall-clock time of that location!
 */
export function getLocationCurrentWallClockDate(lat: number, lng: number): Date {
  const now = new Date();
  const targetOffsetHours = getLocationUtcOffsetHours(lat, lng);
  // Convert current real UTC timestamp to the target location's wall-clock components
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + targetOffsetHours * 3600000);
}

