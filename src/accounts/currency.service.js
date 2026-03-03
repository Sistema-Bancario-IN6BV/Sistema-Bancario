import axios from "axios";

export const convertCurrency = async (amount, from, to) => {
    try {
        const response = await axios.get(`https://open.er-api.com/v6/latest/${from}`);
        const data = response.data;

        if (data.result !== "success") {
            throw new Error("No se pudo obtener la tasa de cambio");
        }

        if (typeof to === "string") {
            const rate = data.rates[to.toUpperCase()];
            if (!rate) throw new Error(`Moneda destino inválida: ${to}`);
            return amount * rate;
        }

        if (Array.isArray(to)) {
            const converted = {};
            to.forEach(curr => {
                const rate = data.rates[curr.toUpperCase()];
                if (!rate) throw new Error(`Moneda destino inválida: ${curr}`);
                converted[curr.toUpperCase()] = amount * rate;
            });
            return converted;
        }

        throw new Error("Parámetro 'to' inválido");
    } catch (error) {
        console.error("Error real de la API de divisas:", error.message);
        throw new Error("Error al conectar con API de divisas. Intenta más tarde.");
    }
};