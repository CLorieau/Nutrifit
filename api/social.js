// api/social.js
import api from "./axiosInstance";

/** -------------------------------------------------------------
 *  NOUVELLES API (Amis) - Appels réels vers le backend
 *  -------------------------------------------------------------
 */

/** Obtenir la liste de mes amis actuels */
export const getFriends = async () => {
  return await api.get('/friends');
};

/** Obtenir les recettes partagées par des amis */
export const getSharedRecipes = async () => {
  return await api.get('/recipes/shared-with-me');
};

/** Obtenir les demandes d'amis en attente (reçues) */
export const getPendingRequests = async () => {
  return await api.get('/friends/requests');
};

/** Recherche des utilisateurs */
export const searchUsers = async (query) => {
  return await api.get('/friends/search', { params: { q: query } });
};

/** Envoyer une demande d'ami */
export const sendFriendRequest = async (userId) => {
  return await api.post('/friends/request', { receiver_id: userId });
};

/** Accepter une demande d'ami */
export const acceptFriendRequest = async (requestId) => {
  return await api.put(`/friends/request/${requestId}/accept`);
};

/** Refuser une demande d'ami (ou supprimer un ami) */
export const rejectFriendRequest = async (requestId) => {
  return await api.delete(`/friends/request/${requestId}/reject`);
};

/** Supprimer un ami ("Ne plus être ami") */
export const removeFriend = async (userId) => {
  return await api.delete(`/friends/${userId}`);
};

/** Stats sociales d'un profil */
export const getSocialStats = async (userId) => {
  return await api.get(`/friends/stats/${userId}`);
};

/** Obtenir le profil complet d'un ami */
export const getFriendProfile = async (userId) => {
  return await api.get(`/users/${userId}/profile`);
};

/** Partager une recette avec un ou plusieurs amis */
export const shareRecipe = async (recipeId, receiverIds) => {
  return await api.post('/recipes/share', { recipe_id: recipeId, receiver_ids: receiverIds });
};
