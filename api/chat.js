import api from "./axiosInstance";

export const chatWithBot = async (message) => {
    try {
        const response = await api.post("/chat", { message });
        return response.data; // { response: "..." }
    } catch (error) {
        console.error("Erreur lors de l'envoi du message au bot :", error);
        throw error;
    }
};
