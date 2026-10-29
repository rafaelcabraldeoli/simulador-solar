export interface LiveWeatherData {
  latitude: number;
  longitude: number;
  cityName?: string;
  countryName?: string;
  temperature: number; // °C
  apparentTemperature: number; // °C
  humidity: number; // %
  cloudCover: number; // 0 - 100%
  precipitation: number; // mm
  rain: number; // mm
  snowfall: number; // cm
  weatherCode: number; // WMO Code (0 to 99)
  isDay: boolean;
  windSpeed: number; // km/h
  windDirection: number; // degrees
  weatherStatusPt: string;
  weatherCategory: 'clear' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm';
  icon: string;
  timestamp: string;
}

export interface WeatherStationPreset {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  continent: string;
}

export const GLOBAL_WEATHER_STATIONS: WeatherStationPreset[] = [
  { id: 'sao_paulo', name: 'São Paulo', country: 'Brasil', lat: -23.5505, lng: -46.6333, continent: 'América do Sul' },
  { id: 'belo_horizonte', name: 'Belo Horizonte (MG)', country: 'Brasil', lat: -19.9167, lng: -43.9345, continent: 'América do Sul' },
  { id: 'rio_de_janeiro', name: 'Rio de Janeiro', country: 'Brasil', lat: -22.9068, lng: -43.1729, continent: 'América do Sul' },
  { id: 'brasilia', name: 'Brasília', country: 'Brasil', lat: -15.7975, lng: -47.8919, continent: 'América do Sul' },
  { id: 'manaus', name: 'Manaus (Amazônia)', country: 'Brasil', lat: -3.1190, lng: -60.0217, continent: 'América do Sul' },
  { id: 'buenos_aires', name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816, continent: 'América do Sul' },
  { id: 'bogota', name: 'Bogotá', country: 'Colômbia', lat: 4.7110, lng: -74.0721, continent: 'América do Sul' },
  { id: 'new_york', name: 'Nova York', country: 'Estados Unidos', lat: 40.7128, lng: -74.0060, continent: 'América do Norte' },
  { id: 'miami', name: 'Miami', country: 'Estados Unidos', lat: 25.7617, lng: -80.1918, continent: 'América do Norte' },
  { id: 'los_angeles', name: 'Los Angeles', country: 'Estados Unidos', lat: 34.0522, lng: -118.2437, continent: 'América do Norte' },
  { id: 'london', name: 'Londres', country: 'Reino Unido', lat: 51.5074, lng: -0.1278, continent: 'Europa' },
  { id: 'paris', name: 'Paris', country: 'França', lat: 48.8566, lng: 2.3522, continent: 'Europa' },
  { id: 'reykjavik', name: 'Reykjavik', country: 'Islândia', lat: 64.1466, lng: -21.9426, continent: 'Europa' },
  { id: 'tokyo', name: 'Tóquio', country: 'Japão', lat: 35.6762, lng: 139.6503, continent: 'Ásia' },
  { id: 'beijing', name: 'Pequim', country: 'China', lat: 39.9042, lng: 116.4074, continent: 'Ásia' },
  { id: 'mumbai', name: 'Mumbai', country: 'Índia', lat: 19.0760, lng: 72.8777, continent: 'Ásia' },
  { id: 'singapore', name: 'Singapura', country: 'Singapura', lat: 1.3521, lng: 103.8198, continent: 'Ásia' },
  { id: 'cairo', name: 'Cairo', country: 'Egito', lat: 30.0444, lng: 31.2357, continent: 'África' },
  { id: 'nairobi', name: 'Nairóbi', country: 'Quênia', lat: -1.2921, lng: 36.8219, continent: 'África' },
  { id: 'cape_town', name: 'Cidade do Cabo', country: 'África do Sul', lat: -33.9249, lng: 18.4241, continent: 'África' },
  { id: 'sydney', name: 'Sydney', country: 'Austrália', lat: -33.8688, lng: 151.2093, continent: 'Oceania' },
  { id: 'antarctica', name: 'Estação McMurdo (Antártica)', country: 'Antártica', lat: -77.8419, lng: 166.6863, continent: 'Polo Sul' },
];

/**
 * Maps WMO Weather interpretation codes to human-readable Portuguese status and category
 */
export function interpretWMOCode(code: number): {
  statusPt: string;
  category: LiveWeatherData['weatherCategory'];
  icon: string;
} {
  switch (code) {
    case 0:
      return { statusPt: 'Céu Limpo (Ensolarado)', category: 'clear', icon: '☀️' };
    case 1:
      return { statusPt: 'Predominantemente Limpo', category: 'clear', icon: '🌤️' };
    case 2:
      return { statusPt: 'Parcialmente Nublado', category: 'cloudy', icon: '⛅' };
    case 3:
      return { statusPt: 'Encoberto / Nublado', category: 'cloudy', icon: '☁️' };
    case 45:
      return { statusPt: 'Nevoeiro / Neblina', category: 'fog', icon: '🌫️' };
    case 48:
      return { statusPt: 'Nevoeiro com Depósito de Gelo', category: 'fog', icon: '🌫️' };
    case 51:
      return { statusPt: 'Garoa Leve', category: 'drizzle', icon: '🌦️' };
    case 53:
      return { statusPt: 'Garoa Moderada', category: 'drizzle', icon: '🌦️' };
    case 55:
      return { statusPt: 'Garoa Densa', category: 'drizzle', icon: '🌧️' };
    case 56:
    case 57:
      return { statusPt: 'Garoa Congelante', category: 'drizzle', icon: '🌧️' };
    case 61:
      return { statusPt: 'Chuva Fraca', category: 'rain', icon: '🌧️' };
    case 63:
      return { statusPt: 'Chuva Moderada', category: 'rain', icon: '🌧️' };
    case 65:
      return { statusPt: 'Chuva Forte e Contínua', category: 'rain', icon: '🌧️' };
    case 66:
    case 67:
      return { statusPt: 'Chuva Congelante', category: 'rain', icon: '🌨️' };
    case 71:
      return { statusPt: 'Neve Leve', category: 'snow', icon: '🌨️' };
    case 73:
      return { statusPt: 'Neve Moderada', category: 'snow', icon: '❄️' };
    case 75:
      return { statusPt: 'Neve Forte / Nevasca', category: 'snow', icon: '❄️' };
    case 77:
      return { statusPt: 'Grãos de Neve', category: 'snow', icon: '❄️' };
    case 80:
      return { statusPt: 'Pancadas de Chuva Leves', category: 'rain', icon: '🌦️' };
    case 81:
      return { statusPt: 'Pancadas de Chuva Moderadas', category: 'rain', icon: '🌧️' };
    case 82:
      return { statusPt: 'Pancadas de Chuva Violentas', category: 'rain', icon: '⛈️' };
    case 85:
    case 86:
      return { statusPt: 'Pancadas de Neve', category: 'snow', icon: '🌨️' };
    case 95:
      return { statusPt: 'Tempestade com Trovoadas e Raios', category: 'thunderstorm', icon: '⛈️' };
    case 96:
      return { statusPt: 'Tempestade com Granizo Leve', category: 'thunderstorm', icon: '⛈️' };
    case 99:
      return { statusPt: 'Tempestade Severa com Granizo Pesado', category: 'thunderstorm', icon: '⚡' };
    default:
      return { statusPt: 'Céu Variável', category: 'clear', icon: '🌤️' };
  }
}

// In-memory cache to avoid duplicate API calls
const weatherCache = new Map<string, { data: LiveWeatherData; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Fetches real-time live meteorological data from Open-Meteo API
 */
export async function fetchLiveWeather(
  lat: number,
  lng: number,
  cityName?: string,
  countryName?: string
): Promise<LiveWeatherData> {
  const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}`;
  const now = Date.now();

  const cached = weatherCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP Error: ${response.status}`);
    }

    const json = await response.json();
    const current = json.current;

    const wmo = interpretWMOCode(current.weather_code || 0);

    const weatherData: LiveWeatherData = {
      latitude: lat,
      longitude: lng,
      cityName: cityName || `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
      countryName: countryName || '',
      temperature: current.temperature_2m ?? 20,
      apparentTemperature: current.apparent_temperature ?? current.temperature_2m ?? 20,
      humidity: current.relative_humidity_2m ?? 60,
      cloudCover: current.cloud_cover ?? 0,
      precipitation: current.precipitation ?? 0,
      rain: (current.rain ?? 0) + (current.showers ?? 0),
      snowfall: current.snowfall ?? 0,
      weatherCode: current.weather_code ?? 0,
      isDay: Boolean(current.is_day),
      windSpeed: current.wind_speed_10m ?? 10,
      windDirection: current.wind_direction_10m ?? 0,
      weatherStatusPt: wmo.statusPt,
      weatherCategory: wmo.category,
      icon: wmo.icon,
      timestamp: current.time || new Date().toISOString(),
    };

    weatherCache.set(cacheKey, {
      data: weatherData,
      expiresAt: now + CACHE_TTL_MS,
    });

    return weatherData;
  } catch (error) {
    console.warn(`[WeatherService] Could not fetch real-time weather for (${lat}, ${lng}):`, error);

    // Graceful fallback with sensible defaults
    const fallbackWmo = interpretWMOCode(0);
    return {
      latitude: lat,
      longitude: lng,
      cityName: cityName || 'Local Selecionado',
      countryName: countryName || '',
      temperature: 22,
      apparentTemperature: 22,
      humidity: 55,
      cloudCover: 20,
      precipitation: 0,
      rain: 0,
      snowfall: 0,
      weatherCode: 0,
      isDay: true,
      windSpeed: 12,
      windDirection: 90,
      weatherStatusPt: fallbackWmo.statusPt,
      weatherCategory: fallbackWmo.category,
      icon: fallbackWmo.icon,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Batch fetches real-time weather for multiple global stations
 */
export async function fetchGlobalWeatherBatch(
  stations: WeatherStationPreset[]
): Promise<LiveWeatherData[]> {
  const promises = stations.map((s) =>
    fetchLiveWeather(s.lat, s.lng, s.name, s.country)
  );
  return Promise.all(promises);
}
