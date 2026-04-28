import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { getFavorites, deleteFavorites } from "../api/favoris";

/**
 * Screen listing user's favorite recipes.
 */
export default function Favorites() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // Fetch favorites when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchFavorites();
    }, []),
  );

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await getFavorites();
      // Expecting response.data to be an array of recipes
      setFavorites(response.data || []);
    } catch (error) {
      // If 404, it might mean no favorites or endpoint issue.
      // Assuming empty list if error or 404 for now, or just log.
      console.error("Error loading favorites:", error);
      // Alert.alert("Error", "Unable to load favorites.");
    } finally {
      setLoading(false);
    }
  };

  const onRemoveFavorite = async (id) => {
    try {
      // Optimistic update
      const previousFavorites = favorites;
      setFavorites((prev) => prev.filter((item) => item.id_recette !== id));

      await deleteFavorites(id);
    } catch (error) {
      console.error("Error deleting favorite:", error);
      Alert.alert("Error", "Unable to remove favorite.");
      fetchFavorites(); // Revert/Refresh
    }
  };

  const onOpenRecipe = (recipe) => {
    // Map properties if needed to match what RecipeDetail expects
    // The API return format should be consistent.
    // Diet.js maps: id: r.id_recette, title: r.nom_recette, kcalPer100: r.calories, image: r.image_url
    // We should pass a similar object or the raw one if RecipeDetail handles it.
    // Diet.js passes: { id, title, kcalPer100, image, liked, ingredients }
    // The API for getFavorites likely returns the same structure as getRecipes.

    const mapped = {
      id: recipe.id_recette,
      title: recipe.nom_recette,
      kcalPer100: recipe.calories,
      image: recipe.image_url,
      liked: true,
      ingredients: recipe.ingredients,
    };

    navigation.navigate("RecipeDetail", { recipe: mapped });
  };

  // Reusing styling from Diet.js for consistency
  const RecipeCard = ({ item }) => (
    <Pressable onPress={() => onOpenRecipe(item)} style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        <Pressable
          onPress={() => onRemoveFavorite(item.id_recette)}
          style={styles.heartBtn}
        >
          {/* Always active/heart because it is in Favorites */}
          <Ionicons name="heart" size={22} color="#FF0000" />
        </Pressable>
      </View>
      <View style={styles.cardContent}>
        <Text numberOfLines={2} style={styles.cardTitle}>
          {item.nom_recette}
        </Text>
        <Text style={styles.cardInfo}>{item.calories} kcal per 100g</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>My Favorites</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id_recette)}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => <RecipeCard item={item} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-dislike-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No favorites yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backBtn: {
    padding: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  card: {
    flex: 0.48, // slightly less than 0.5 to fit gap
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  imageContainer: {
    height: 120,
    backgroundColor: "#F3F4F6",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  heartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff", // White bg as requested for active
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 4,
  },
  cardInfo: {
    color: "#6B7280",
    fontSize: 12,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    color: "#888",
    fontSize: 16,
  },
});
