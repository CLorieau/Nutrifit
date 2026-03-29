// api/social.js
import api from "./axiosInstance";

/** Recherche des utilisateurs par nom */
export const searchUsers = (query) =>
  api.get("/social/search", { params: { q: query } });

/** Suivre un utilisateur */
export const followUser = (userId) =>
  api.post(`/social/follow/${userId}`);

/** Ne plus suivre un utilisateur */
export const unfollowUser = (userId) =>
  api.delete(`/social/follow/${userId}`);

/** Mes abonnés */
export const getFollowers = () =>
  api.get("/social/followers");

/** Mes abonnements */
export const getFollowing = () =>
  api.get("/social/following");

/** Stats sociales d'un profil */
export const getSocialStats = (userId) =>
  api.get(`/social/stats/${userId}`);
