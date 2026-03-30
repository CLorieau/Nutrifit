// Importation des modules nécessaires depuis React et React Native
import React, { useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Image,
} from "react-native";
import { getProfile } from "../api/profileAPI";
import { getSharedRecipes, getSocialStats } from "../api/social";

// Import de la bibliothèque d’icônes Ionicons (incluse avec Expo)
import { Ionicons } from "@expo/vector-icons";

// Import du composant graphique pour créer le cercle de progression
import * as Progress from "react-native-progress";

// Import du hook "useSafeAreaInsets"
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 🔥 AJOUT : Import du AuthContext pour accéder à signOut()
import AuthContext from "../AuthContext";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { signOut } = useContext(AuthContext);
  const navigation = useNavigation();

  const [hasError, setHasError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [friendsCount, setFriendsCount] = React.useState(0);
  const [sharedRecipes, setSharedRecipes] = React.useState([]);

  const [userData, setUserData] = React.useState({
    prenom: "",
    nom: "",
    age: 0,
    objectif: "",
    poids_kg: 0,
    taille_cm: 0,
    sexe: "masculin",
    nb_jours_entrainement: 0,
  });

  const fetchUserData = async () => {
    try {
      const response = await getProfile();
      setUserData(response.data);
      const sharedRes = await getSharedRecipes();
      setSharedRecipes(sharedRes.data || []);
      
      if (response.data?.id_utilisateur) {
          try {
              const statsRes = await getSocialStats(response.data.id_utilisateur);
              setFriendsCount(statsRes.data?.friends_count || 0);
          } catch (e) {
              console.log("Error fetching stats:", e);
          }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, []),
  );

  // Calculate calories based on user stats
  const calculateCalories = (user) => {
    if (!user.poids_kg || !user.taille_cm || !user.age)
      return { total: 2000, left: 2000 };

    // Mifflin-St Jeor Equation
    let bmr = 10 * user.poids_kg + 6.25 * user.taille_cm - 5 * user.age;
    bmr += user.sexe === "feminin" ? -161 : 5;

    // Activity Multiplier Estimation
    let activityMultiplier = 1.2;
    if (user.nb_jours_entrainement >= 1 && user.nb_jours_entrainement <= 3)
      activityMultiplier = 1.375;
    else if (user.nb_jours_entrainement >= 4 && user.nb_jours_entrainement <= 5)
      activityMultiplier = 1.55;
    else if (user.nb_jours_entrainement >= 6) activityMultiplier = 1.725;

    const total = Math.round(bmr * activityMultiplier);
    // Assuming no tracked food for now, so left = total
    return { total, left: total };
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Oui",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 20,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color="#A3FF3D" />
      </View>
    );
  }

  const { total: totalCalories, left: caloriesLeft } =
    calculateCalories(userData);
  const progress = totalCalories > 0 ? 1 - caloriesLeft / totalCalories : 0;

  // Display name: Prenom + Nom
  const displayName = userData.prenom
    ? `${userData.prenom} ${userData.nom || ""}`.trim()
    : "Utilisateur";

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Profil</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("EditProfile", { userData })}
        >
          <Text style={styles.editButtonText}>Modifier</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-outline" size={60} color="#fff" />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userDetails}>
            {userData.age} yo {userData.objectif || "Aucun"}
          </Text>
          
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}
            onPress={() => navigation.navigate("Community")}
          >
            <Text style={{ color: '#888', fontSize: 13, fontWeight: '500' }}>
               {friendsCount} Amis
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#888" style={{ marginLeft: 2, marginTop: 1 }} />
          </TouchableOpacity>
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
            <Text style={{ fontWeight: "600" }}>{caloriesLeft}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.sectionTitle}>Mes objectifs</Text>
        </View>

        <Text style={styles.goalLine}>{userData.objectif || "Non défini"}</Text>
        <Text style={styles.goalLine}>Calories: {totalCalories} kcal</Text>
        <Text style={styles.goalLine}>Poids: {userData.poids_kg} kg</Text>
      </View>

      <View style={{ marginTop: 24 }}>
        <Text style={[styles.sectionTitle, { color: '#000' }]}>Partagées avec vous</Text>
        {sharedRecipes.length > 0 ? (
          <FlatList 
            horizontal
            data={sharedRecipes}
            keyExtractor={it => it.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20, marginTop: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                 activeOpacity={0.8}
                 style={styles.sharedRecipeCard}
                 onPress={() => navigation.navigate("RecipeDetail", { recipe: item.recette })}
              >
                  <Image source={{ uri: item.recette?.image_url }} style={styles.sharedRecipeImage} />
                  <View style={styles.sharedRecipeOverlay}>
                     <Text style={styles.sharedRecipeTitle} numberOfLines={2}>{item.recette?.nom_recette}</Text>
                  </View>
                  <TouchableOpacity 
                     activeOpacity={0.8}
                     style={styles.sharedSenderBubble}
                     onPress={(e) => {
                        navigation.navigate("FriendProfile", { user: item.sender });
                     }}
                     hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  >
                     <Image source={{ uri: item.sender?.path_pp }} style={styles.sharedSenderAvatar} />
                  </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={{ color: '#888', marginTop: 12 }}>Aucune recette reçue.</Text>
        )}
      </View>

      <View style={styles.bottomCard}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate("Community")}
        >
          <Text style={styles.optionText}>Mes Amis</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate("Favorites")}
        >
          <Text style={styles.optionText}>Favoris</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        {/* 🔥 AJOUT : Bouton de déconnexion connecté */}
        <TouchableOpacity style={styles.optionButton} onPress={handleLogout}>
          <Text style={styles.optionText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    color: "#0A0A0A",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000", // Black for visibility on white
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
  sharedRecipeCard: {
    width: 180,
    height: 120,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  sharedRecipeImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  sharedRecipeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  sharedRecipeTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sharedSenderBubble: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#000',
    overflow: 'hidden',
  },
  sharedSenderAvatar: {
    width: '100%',
    height: '100%',
  },
});
