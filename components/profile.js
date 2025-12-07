// Importation des modules nécessaires depuis React et React Native
import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";

// Import de la bibliothèque d’icônes Ionicons (incluse avec Expo)
import { Ionicons } from "@expo/vector-icons";

// Import du composant graphique pour créer le cercle de progression
import * as Progress from "react-native-progress";

// Import du hook "useSafeAreaInsets"
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 🔥 AJOUT : Import du AuthContext pour accéder à signOut()
import AuthContext from "../AuthContext";

export default function Profile() {
  const insets = useSafeAreaInsets();

  // 🔥 AJOUT : on récupère signOut() depuis le contexte
  const { signOut } = useContext(AuthContext);

  // 🔥 AJOUT : Fonction de déconnexion avec confirmation
  const handleLogout = () => {
    Alert.alert(
        "Déconnexion",
        "Voulez-vous vraiment vous déconnecter ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Oui",
            style: "destructive",
            onPress: () => signOut(),
          },
        ]
    );
  };

  const user = {
    name: "Thibz le goat",
    age: 20,
    goal: "Perte de poids",
    caloriesLeft: 1171,
    totalCalories: 1663,
    weight: 50,
  };

  const progress = 1 - user.caloriesLeft / user.totalCalories;

  return (
      <View
          style={[
            styles.container,
            { paddingTop: insets.top + 20 },
          ]}
      >
        <Text style={styles.title}>Profil</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-outline" size={60} color="#fff" />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userDetails}>
              {user.age} yo {user.goal}
            </Text>
          </View>

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

        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.sectionTitle}>Mes objectifs</Text>
            <TouchableOpacity>
              <Text style={styles.editText}>Modifier</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.goalLine}>{user.goal}</Text>
          <Text style={styles.goalLine}>
            Calories: {user.totalCalories} kcal
          </Text>
          <Text style={styles.goalLine}>Poids: {user.weight} kg</Text>
        </View>

        <View style={styles.bottomCard}>
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionText}>Favoris</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* 🔥 AJOUT : Bouton de déconnexion connecté */}
          <TouchableOpacity style={styles.optionButton} onPress={handleLogout}>
            <Text style={styles.optionText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 20,
    color: "#0A0A0A",
  },
  profileCard: {
    backgroundColor: "#000",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarContainer: {
    backgroundColor: "#333",
    borderRadius: 50,
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  userDetails: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 5,
  },
  progressContainer: {
    alignItems: "center",
  },
  kcalText: {
    color: "#bbb",
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
  },
  goalCard: {
    backgroundColor: "#000",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  editText: {
    color: "#A3FF3D",
    fontSize: 16,
  },
  goalLine: {
    color: "#bbb",
    fontSize: 16,
    marginTop: 5,
  },
  bottomCard: {
    backgroundColor: "#000",
    borderRadius: 20,
    paddingVertical: 20,
    marginTop: 20,
  },
  optionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  optionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#555",
    marginHorizontal: 20,
  },
});
