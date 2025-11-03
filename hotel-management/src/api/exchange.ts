import axios from "axios";

/**
 * Convierte un monto entre dos monedas.
 * @param from - Código de la moneda de origen (por ejemplo "ARS")
 * @param to - Código de la moneda destino (por ejemplo "USD")
 * @param amount - Monto numérico a convertir
 */
export const convertCurrency = async (from: string, to: string, amount: number) => {
  try {
    const response = await axios.get("https://api.exchangerate.host/convert", {
      params: { from, to, amount },
    });
    return response.data.result;
  } catch (error) {
    console.error("Error al convertir moneda:", error);
    return null;
  }
};
