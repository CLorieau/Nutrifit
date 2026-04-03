// components/diet.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * Écran DIET (recettes)
 * - Données fictives locales pour l’instant
 * - Conçu pour passer facilement en mode API plus tard
 * - Images via URL
 */

const LOCALE = "fr-FR";

import api from "../api/axiosInstance";
import { getFavorites, addFavorites, deleteFavorites } from "../api/favoris";
import { useChat } from "../ChatContext";
import { useFocusEffect } from "@react-navigation/native";

export default function Diet({ navigation }) {
  const insets = useSafeAreaInsets();
  const { openChat } = useChat();

  // ————— ÉTATS
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [allRecipes, setAllRecipes] = useState([]);

  // ————— API CALL
  const fetchData = async () => {
    try {
      setLoading(true);
      const [recipesRes, favRes] = await Promise.all([
        api.get("/recettes"),
        getFavorites(),
      ]);

      const recipesData = recipesRes.data;
      const favData = favRes.data || [];

      // Create a set of favorite IDs
      // Assuming getFavorites returns list of recipes or objects with id_recette
      // If favData is list of recipes:
      const favIds = new Set(favData.map((r) => r.id_recette));
      setLiked(favIds);

      // Mapping des données
      const mapped = recipesData.map((r) => ({
        id: r.id_recette,
        title: r.nom_recette,
        kcalPer100: r.calories,
        image: r.image_url,
        // liked: favIds.has(r.id_recette),
        // -> On gère "liked" via le state 'liked' (Set), donc on n'a pas forcément besoin de le mettre dans l'objet
        // mais pour l'affichage initial c'est pratique.
        // Ici on va se baser sur le Set 'liked' dans le useMemo 'filtered'.
        ingredients: r.ingredients,
      }));

      setAllRecipes(mapped);
    } catch (error) {
      console.error("Erreur chargement données:", error);
      Alert.alert("Erreur", "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );

  // ————— DONNÉES AFFICHÉES (filtrage par recherche)
  // On sépare en deux listes arbitrairement pour l'UI (ex: 5 premiers = most loved)
  const filtered = useMemo(() => {
    let list = allRecipes;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q));
    }
    // Mise à jour de l'état "liked" local
    return list.map((r) => ({ ...r, liked: liked.has(r.id) }));
  }, [query, allRecipes, liked]);

  const mostLoved = useMemo(() => filtered.slice(0, 5), [filtered]);
  const forYou = useMemo(() => filtered.slice(5), [filtered]);

  // ————— ACTIONS
  // ————— ACTIONS
  const toggleLike = async (id) => {
    try {
      const isLiked = liked.has(id);

      // Update UI optimistically
      setLiked((prev) => {
        const next = new Set(prev);
        if (isLiked) next.delete(id);
        else next.add(id);
        return next;
      });

      if (isLiked) {
        await deleteFavorites(id);
      } else {
        await addFavorites(id);
      }
    } catch (error) {
      console.error("Erreur toggle like:", error);
      // Revert UI on error
      setLiked((prev) => {
        const next = new Set(prev);
        if (liked.has(id))
          next.add(id); // was liked, so add back
        else next.delete(id); // was not liked, so remove
        return next;
      });
      Alert.alert("Erreur", "Impossible de modifier les favoris.");
    }
  };

  const onOpenRecipe = (recipe) => {
    // plus tard: navigation vers “RecipeDetail”
    // navigation.navigate('RecipeDetail', { id: recipe.id })
    navigation.navigate("RecipeDetail", { recipe });
  };

  const onAdd = () => {
    Alert.alert(
      "Créer une recette",
      "On fera un formulaire d'ajout plus tard.",
    );
  };

  // ————— COMPOSANTS
  const HeartBtn = ({ active, onPress, size = 22 }) => (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: active ? "#fff" : "rgba(0,0,0,0.35)",
      }}
    >
      <Ionicons
        name={active ? "heart" : "heart-outline"}
        size={size}
        color={active ? "#FF0000" : "#fff"}
      />
    </Pressable>
  );

  const LargeRecipeCard = ({ item, onPress, onToggleLike }) => (
    <Pressable
      onPress={onPress}
      style={{
        width: 220,
        height: 150,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#111",
        marginRight: 14,
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: "100%", height: "100%", position: "absolute" }}
      />
      {/* Overlay sombre */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.28)",
        }}
      />
      <View style={{ flex: 1, padding: 12, justifyContent: "space-between" }}>
        <View style={{ alignItems: "flex-end" }}>
          <HeartBtn active={item.liked} onPress={onToggleLike} />
        </View>
        <View>
          <Text
            numberOfLines={1}
            style={{
              color: "#fff",
              fontWeight: "700",
              fontSize: 16,
              marginBottom: 4,
            }}
          >
            {item.title}
          </Text>
          <Text style={{ color: "#E5E7EB", fontSize: 12 }}>
            {item.kcalPer100} kcal per 100g
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const SmallRecipeCard = ({ item, onPress, onToggleLike }) => (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        height: 210,
        borderRadius: 16,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#EEE",
        marginRight: 10,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      <View style={{ height: 120, backgroundColor: "#F3F4F6" }}>
        <Image
          source={{ uri: item.image }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        <View style={{ position: "absolute", top: 8, right: 8 }}>
          <HeartBtn active={item.liked} onPress={onToggleLike} />
        </View>
      </View>
      <View style={{ padding: 12 }}>
        <Text numberOfLines={2} style={{ fontWeight: "700" }}>
          {item.title}
        </Text>
        <Text style={{ marginTop: 4, color: "#6B7280", fontSize: 12 }}>
          {item.kcalPer100} kcal per 100g
        </Text>
      </View>
    </Pressable>
  );

  // ————— RENDU
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#F5F5F7",
      }}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER LOGO + IA */}
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 25,
        marginBottom: 15,
      }}>
        <Image source={require("../assets/logo.png")} style={{ width: 150, height: 50, resizeMode: "contain" }} />
        <TouchableOpacity style={{
          backgroundColor: "#000",
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
        }} onPress={openChat}>
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View
        style={{
          paddingHorizontal: 25,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <View
          style={{
            flex: 1,
            height: 48,
            borderRadius: 14,
            backgroundColor: "#111",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
          }}
        >
          <Ionicons name="search" size={20} color="#fff" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for a recipe"
            placeholderTextColor="#D1D5DB"
            style={{
              flex: 1,
              color: "#fff",
              marginLeft: 8,
              paddingVertical: 8,
            }}
          />
        </View>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        <View>
          {/* SECTION: Most loved */}
          <View style={{ paddingHorizontal: 25, marginBottom: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: "800" }}>Most loved</Text>
          </View>

          <FlatList
            data={mostLoved}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 25 }}
            renderItem={({ item }) => (
              <LargeRecipeCard
                item={item}
                onPress={() => onOpenRecipe(item)}
                onToggleLike={() => toggleLike(item.id)}
              />
            )}
          />

          {/* SECTION: For you */}
          <View
            style={{ paddingHorizontal: 25, marginTop: 20, marginBottom: 6 }}
          >
            <Text style={{ fontSize: 20, fontWeight: "800" }}>For you</Text>
            <Text style={{ color: "#6B7280", marginTop: 2, fontSize: 12 }}>
              Special weight loss recipes
            </Text>
          </View>

          <View style={{ paddingHorizontal: 25 }}>
            <FlatList
              data={forYou}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              renderItem={({ item }) => (
                <SmallRecipeCard
                  item={item}
                  onPress={() => onOpenRecipe(item)}
                  onToggleLike={() => toggleLike(item.id)}
                />
              )}
              ListEmptyComponent={
                <View
                  style={{
                    paddingVertical: 30,
                    alignItems: "center",
                    opacity: 0.7,
                  }}
                >
                  <Ionicons name="leaf-outline" size={28} />
                  <Text style={{ marginTop: 8, color: "#6B7280" }}>
                    Aucune recette ne correspond à ta recherche
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// petite astuce RN sans import direct
const StyleSheet = {
  absoluteFillObject: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
};
