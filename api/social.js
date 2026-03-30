// api/social.js
import api from "./axiosInstance";

/** Fake Data pour Mocks */
const fakeUsers = [
  { 
    id_utilisateur: 101, prenom: 'Emma', nom: 'Royer', path_pp: 'https://i.pravatar.cc/150?img=1',
    statusIcon: '🔥', statusText: 'A complété sa séance aujourd\'hui',
    age: 24, objectif: 'Gain de muscle', 
    recipes: [
      { id: 1, title: 'Oatmeal Protéiné', image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400' },
      { id: 2, title: 'Bowl Poulet', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' }
    ],
    programs: [
      { id: 10, title: 'Force Intégrale 4 Jours' },
      { id: 11, title: 'Abdos en 10 min' }
    ]
  },
  { 
    id_utilisateur: 102, prenom: 'Lucas', nom: 'Bernard', path_pp: 'https://i.pravatar.cc/150?img=11',
    statusIcon: '👨‍🍳', statusText: 'A cuisiné une nouvelle recette',
    age: 28, objectif: 'Perte de poids',
    recipes: [
      { id: 3, title: 'Salade César Light', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400' }
    ],
    programs: [
      { id: 12, title: 'Cardio HIIT' }
    ]
  },
  { 
    id_utilisateur: 103, prenom: 'Chloé', nom: 'Martin', path_pp: 'https://i.pravatar.cc/150?img=5',
    statusIcon: '✅', statusText: 'A atteint son objectif calorique hier',
    age: 22, objectif: 'Maintien de forme',
    recipes: [],
    programs: [
      { id: 13, title: 'Yoga Matinal' }
    ]
  },
  { id_utilisateur: 104, prenom: 'Hugo', nom: 'Dubois', path_pp: 'https://i.pravatar.cc/150?img=12' },
  { id_utilisateur: 105, prenom: 'Léa', nom: 'Thomas', path_pp: 'https://i.pravatar.cc/150?img=9' },
];

const fakeFriendRequests = [
  { 
    id_utilisateur: 201, prenom: 'Alice', nom: 'Durand', path_pp: 'https://i.pravatar.cc/150?img=3',
    statusIcon: '🎯', statusText: 'A commencé un nouveau défi', age: 26, objectif: 'Performance'
  },
  { id_utilisateur: 202, prenom: 'Maxime', nom: 'Petit', path_pp: 'https://i.pravatar.cc/150?img=8' },
];

const fakeSharedRecipes = [
  { 
    id: 1, 
    id_recette: 1,
    title: 'Oatmeal Protéiné', 
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400',
    sender: { id_utilisateur: 101, prenom: 'Emma', path_pp: 'https://i.pravatar.cc/150?img=1' }
  },
  { 
    id: 2, 
    id_recette: 3,
    title: 'Salade César Light', 
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400',
    sender: { id_utilisateur: 102, prenom: 'Lucas', path_pp: 'https://i.pravatar.cc/150?img=11' }
  }
];

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
