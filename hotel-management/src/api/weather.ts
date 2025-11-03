import axios from "axios";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/forecast";

/**
 * Obtiene el pronóstico del clima de la ciudad indicada.
 * @param city - nombre de la ciudad (por ejemplo "Salta")
 */
export const getWeather = async (city: string) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: city,
        units: "metric", // unidades métricas (°C)
        lang: "es", // idioma español
        appid: API_KEY, // tu clave de API
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener el clima:", error);
    return null;
  }
};
