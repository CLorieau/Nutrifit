// api/calendrier.js
import api from "./axiosInstance";

/**
 * Récupère le planning réel depuis le serveur.
 * @param {number} userId - L'ID de l'utilisateur
 * @param {string} dateStr - La date au format 'YYYY-MM-DD'
 */
export const getPlanningByDate = async (userId, dateStr) => {
  try {
    // Appel GET vers ta future route (ex: /api/calendrier/jour)
    // Les paramètres sont envoyés dans l'URL: /api/calendrier/jour?userId=180001&date=2026-01-20
    const response = await axiosInstance.get("/calendrier/jour", {
      params: {
        userId: userId,
        date: dateStr,
      },
    });

    // On renvoie directement les données (axios met le json dans .data)
    return response.data;
  } catch (error) {
    console.error("Erreur API Calendrier :", error);
    // En cas d'erreur, on peut renvoyer une structure vide pour ne pas faire planter l'app
    return { repas: [], seances: [] };
  }
};
