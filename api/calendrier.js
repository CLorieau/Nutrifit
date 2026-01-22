// api/calendrier.js
import api from "./axiosInstance";

/**
 * Récupère tout le calendrier (tous les jours).
 */
export const getAllPlanning = async () => {
  try {
    // Appel GET vers /calendar
    const response = await api.get("/calendar");
    return response.data;
  } catch (error) {
    console.error("Erreur API Calendrier (All) :", error);
    // On renvoie une structure vide par défaut
    return { repas: [], seances: [] };
  }
};

/**
 * Récupère le planning réel pour un jour spécifique.
 * @param {number} userId - L'ID de l'utilisateur (ignoré car le token gère l'auth)
 * @param {string} dateStr - La date au format 'YYYY-MM-DD'
 */
export const getPlanningByDate = async (userId, dateStr) => {
  try {
    // Appel GET vers /calendar/{jour}
    const response = await api.get(`/calendar/${dateStr}`);

    // On renvoie directement les données
    return response.data;
  } catch (error) {
    console.error("Erreur API Calendrier (Day) :", error);
    // En cas d'erreur, on renvoie une structure vide
    return { jour: dateStr, repas: [], seances: [] };
  }
};
