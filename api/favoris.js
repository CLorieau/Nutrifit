import api from "./axiosInstance";

export const getFavorites = () => {
  return api.get("/favorites");
};

// Ajout d'une recette à la liste des favoris via son id
export const addFavorites = (id) => {
  return api.post("/favorites/" + id);
};

// Suppression d'une recette de la liste des favoris via son id
export const deleteFavorites = (id) => {
  return api.delete("/favorites/" + id);
};
