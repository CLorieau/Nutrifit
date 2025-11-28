// Importation des modules nécessaires depuis React et React Native
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// Import de la bibliothèque d’icônes Ionicons (incluse avec Expo)
import { Ionicons } from "@expo/vector-icons";

// Import du composant graphique pour créer le cercle de progression
import * as Progress from "react-native-progress";

// Import du hook "useSafeAreaInsets" pour gérer automatiquement les marges liées aux zones sécurisées (notch, barre de statut…)
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import de ka méthode d’appel API pour récupérer les données du profil
import { getProfile } from "../api/profileAPI";

// =====================================================================
//                     COMPOSANT PRINCIPAL "Profile"
// =====================================================================
export default function Profile() {

  // Récupère les marges de sécurité de l’écran (haut, bas, etc.)
  // Cela permet d’éviter que le contenu soit caché derrière une encoche ou une barre de statut.
  const insets = useSafeAreaInsets();

  // Données simulées de l’utilisateur
  // Plus tard, ces données viendront d’une base ou d’un contexte utilisateur.
  const user = {
    name: "Thibz le goat",
    age: 20,
    goal: "Perte de poids",     // Objectif : perte de poids
    caloriesLeft: 1171,      // Kcal restantes dans la journée
    totalCalories: 1663,     // Objectif calorique quotidien
    weight: 50,              // Poids actuel
  };

  // Calcul du pourcentage de progression pour le cercle des calories
  // Exemple : si 1171 kcal sur 1663 sont "left", alors le cercle est rempli à environ 30%
  const progress = 1 - user.caloriesLeft / user.totalCalories;

  // =====================================================================
  //                         STRUCTURE VISUELLE
  // =====================================================================
  return (
    // Vue principale qui englobe tout l’écran
    <View
      style={[
        styles.container,
        {
          // Ajoute une marge supérieure adaptée à la zone safe + 20 px
          // → Cela donne le même espacement que dans ton écran de calendrier
          paddingTop: insets.top + 20,
        },
      ]}
    >

      {/* ====== TITRE PRINCIPAL ====== */}
      <Text style={styles.title}>Profil</Text>

      {/* ====== CARTE D’INFORMATIONS DU PROFIL ====== */}
      <View style={styles.profileCard}>

        {/* Icône d’utilisateur à la place d’une photo */}
        <View style={styles.avatarContainer}>
          <Ionicons name="person-outline" size={60} color="#fff" />
        </View>

        {/* Nom, âge et objectif affichés à côté de l’icône */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userDetails}>
            {user.age} yo {user.goal}
          </Text>
        </View>

        {/* Cercle de progression avec le nombre de kcal restantes */}
        <View style={styles.progressContainer}>
          <Progress.Circle
            size={60}
            progress={progress}
            color="#A3FF3D"
            unfilledColor="#222"
            borderWidth={0}
            thickness={6}
          />

          <Text style={styles.kcalText}>
            Kcal left{"\n"}
            <Text style={{ fontWeight: "600" }}>{user.caloriesLeft}</Text>
          </Text>
        </View>
      </View>

      {/* ====== CARTE "OBJECTIFS" ====== */}
      <View style={styles.goalCard}>

        {/* En-tête de la section (titre + bouton Edit) */}
        <View style={styles.goalHeader}>
          <Text style={styles.sectionTitle}>Mes objectifs</Text>

          {/* Bouton "Modifier" (sans action pour l’instant) */}
          <TouchableOpacity>
            <Text style={styles.editText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        {/* Détails des objectifs : type, calories et poids */}
        <Text style={styles.goalLine}>{user.goal}</Text>
        <Text style={styles.goalLine}>
          Calories: {user.totalCalories} kcal
        </Text>
        <Text style={styles.goalLine}>Poids: {user.weight} kg</Text>
      </View>

      {/* ====== CARTE DU BAS (Favori / Déconnexion) ====== */}
      <View style={styles.bottomCard}>

        {/* Lien vers les favoris (future navigation possible) */}
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>Favoris</Text>
        </TouchableOpacity>

        {/* Ligne de séparation entre les options */}
        <View style={styles.separator} />

        {/* Bouton de déconnexion */}
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// =====================================================================
//                            STYLES
// =====================================================================
const styles = StyleSheet.create({

  // Conteneur principal de la page
  container: {
    flex: 1,               // prend toute la hauteur disponible
    backgroundColor: "#fff",
    paddingHorizontal: 20, // marge à gauche et à droite
  },

  // Titre principal ("Profil")
  title: {
    fontSize: 34,          // taille grande (comme dans l’écran calendrier)
    fontWeight: "700",     // texte épais
    marginBottom: 20,      // espace sous le titre
    color: "#0A0A0A",      // noir doux (pas trop saturé)
  },

  // Carte contenant les infos utilisateur
  profileCard: {
    backgroundColor: "#000",       // fond noir
    borderRadius: 20,              // coins arrondis
    padding: 20,                   // espace intérieur
    flexDirection: "row",          // éléments alignés horizontalement
    alignItems: "center",          // centrage vertical
    justifyContent: "space-between", // espace entre chaque sous-élément
  },

  // Conteneur pour l’icône de profil
  avatarContainer: {
    backgroundColor: "#333",   // gris foncé (contraste sur fond noir)
    borderRadius: 50,          // rend le fond circulaire
    width: 70,
    height: 70,
    alignItems: "center",      // centre horizontalement
    justifyContent: "center",  // centre verticalement
  },

  // Bloc contenant le nom et les détails utilisateur
  userInfo: {
    flex: 1,                   // prend tout l’espace libre restant
    marginLeft: 15,            // espace entre l’icône et le texte
  },

  // Nom d’utilisateur
  userName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  // Détails (âge + objectif)
  userDetails: {
    color: "#bbb",             // gris clair
    fontSize: 14,
    marginTop: 5,
  },

  // Conteneur du cercle kcal
  progressContainer: {
    alignItems: "center",
  },

  // Texte sous le cercle ("Kcal left 1171")
  kcalText: {
    color: "#bbb",
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
  },

  // Carte des objectifs
  goalCard: {
    backgroundColor: "#000",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },

  // En-tête (titre + bouton Edit)
  goalHeader: {
    flexDirection: "row",        // aligné sur une ligne
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  // Titre "My goals"
  sectionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  // Texte du bouton Edit
  editText: {
    color: "#A3FF3D",          // vert clair
    fontSize: 16,
  },

  // Lignes d’objectifs
  goalLine: {
    color: "#bbb",
    fontSize: 16,
    marginTop: 5,
  },

  // Carte du bas (favori / déconnexion)
  bottomCard: {
    backgroundColor: "#000",
    borderRadius: 20,
    paddingVertical: 20,
    marginTop: 20,
  },

  // Bouton dans la carte du bas
  optionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },

  // Texte des boutons ("Favori" / "Déconnexion")
  optionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },

  // Ligne de séparation entre les deux boutons
  separator: {
    height: 1,
    backgroundColor: "#555",
    marginHorizontal: 20,
  },
});
