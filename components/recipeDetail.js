// components/recipeDetail.js
import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { addFavorites, deleteFavorites } from "../api/favoris";
import { getFriends, shareRecipe } from "../api/social";
import { useBlindMode } from "../BlindModeContext";

export default function RecipeDetail({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { recipe, recipeId } = route.params || {};
  const { blindMode } = useBlindMode();

  const [currentRecipe, setCurrentRecipe] = useState(recipe || null);
  const [loading, setLoading] = useState(!recipe && !!recipeId);
  const [liked, setLiked] = useState(recipe?.liked ?? false);

  useEffect(() => {
    // If we have an ID but no object, fetch it
    if (!currentRecipe && recipeId) {
      const fetchRecipe = async () => {
        try {
          setLoading(true);
          const { getRecette } = require("../api/recettes");
          const res = await getRecette(recipeId);
          setCurrentRecipe(res.data);
          setLiked(res.data.liked ?? false);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchRecipe();
    }
  }, [recipeId, currentRecipe]);

  const toggleLike = async () => {
    const id = currentRecipe?.id_recette || recipeId;
    if (!id) return;

    // Optimistic UI update
    setLiked((prev) => !prev);

    try {
      if (liked) {
        await deleteFavorites(id);
      } else {
        await addFavorites(id);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert if error
      setLiked((prev) => !prev);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // --- Share Modal State ---
  const [shareVisible, setShareVisible] = useState(false);
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);

  useEffect(() => {
    if (shareVisible && friends.length === 0) {
      getFriends().then(res => setFriends(res.data || [])).catch(console.error);
    }
  }, [shareVisible, friends.length]);

  const handleToggleFriend = (id) => {
    setSelectedFriends(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleShare = async () => {
    if (selectedFriends.length === 0) return;
    try {
      const p_id = currentRecipe?.id_recette || currentRecipe?.id || recipeId;
      if (!p_id) {
          Alert.alert("Erreur", "L'identifiant de la recette est introuvable.");
          return;
      }
      
      await shareRecipe(p_id, selectedFriends);
      Alert.alert("Succès", `Recette partagée avec succès à ${selectedFriends.length} ami(s) !`);
      setShareVisible(false);
      setSelectedFriends([]);
    } catch (error) {
      console.error("Erreur lors du partage :", error.response?.data || error.message);
      
      const errorMsg = error.response?.data 
        ? JSON.stringify(error.response.data) 
        : "Impossible de partager la recette.";
        
      Alert.alert("Erreur API", errorMsg);
    }
  };

  const filteredFriends = friends.filter(f => 
    `${f.prenom} ${f.nom}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Parse ingredients safely
  const ingredients = useMemo(() => {
    if (!currentRecipe?.ingredients) return [];
    try {
      // Check if it's already an object (if passed pre-parsed) or a string
      return typeof currentRecipe.ingredients === "string"
        ? JSON.parse(currentRecipe.ingredients)
        : currentRecipe.ingredients;
    } catch (error) {
      console.error("Error parsing ingredients:", error);
      return [];
    }
  }, [currentRecipe?.ingredients]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

  if (!currentRecipe) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F5F5F7",
        }}
      >
        <Text>Recette introuvable.</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F5F5F7",
        paddingTop: insets.top + 8,
      }}
    >
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          marginBottom: 8,
        }}
      >
        <Pressable onPress={handleBack} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: "600", flex: 1, textAlign: 'center' }} numberOfLines={1}>
          {currentRecipe.title || currentRecipe.nom_recette}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => setShareVisible(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 4
            }}
          >
            <Ionicons name="paper-plane-outline" size={24} color="#000" />
          </Pressable>
        <Pressable
          onPress={toggleLike}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={24}
            color={liked ? "red" : "#000"}
          />
        </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* IMAGE PRINCIPALE */}
        <View
          style={{
            paddingHorizontal: 20,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "#E5E7EB",
            }}
          >
            <Image
              source={{
                uri:
                  currentRecipe.image ||
                  currentRecipe.image_url ||
                  currentRecipe.image_path,
              }}
              style={{ width: "100%", height: 260 }}
              resizeMode="cover"
            />
          </View>
          <View
            style={{
              position: "absolute",
              bottom: 16,
              left: 36,
              backgroundColor: "rgba(0,0,0,0.45)",
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              {currentRecipe.title || currentRecipe.nom_recette}
            </Text>
            {!blindMode && (
              <>
                <Text style={{ color: "#E5E7EB", fontSize: 12 }}>
                  {currentRecipe.kcalPer100 || currentRecipe.calories} kcal per 100g
                </Text>
                <Text style={{ color: "#E5E7EB", fontSize: 12 }}>
                  20g protein | 5g fat | 10g carbs
                </Text>
              </>
            )}
          </View>
        </View>

        {/* INGREDIENTS */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
            Ingredients
          </Text>

          {ingredients.length === 0 ? (
            <Text style={{ fontStyle: "italic", color: "#666" }}>
              Pas d'ingrédients listés.
            </Text>
          ) : (
            <View style={{ marginTop: 4 }}>
              {ingredients.map((ing, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    paddingVertical: 12,
                    borderBottomWidth: index === ingredients.length - 1 ? 0 : 1,
                    borderBottomColor: "#E5E7EB",
                  }}
                >
                  {/* Bullet point */}
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "#111",
                      marginTop: 8,
                      marginRight: 12,
                    }}
                  />
                  {/* Content */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#111",
                        marginBottom: 2,
                      }}
                    >
                      {ing.food
                        ? ing.food.charAt(0).toUpperCase() + ing.food.slice(1)
                        : "Ingrédient"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#666",
                        lineHeight: 20,
                      }}
                    >
                      {ing.text}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL DE PARTAGE */}
      <Modal visible={shareVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.bottomSheet}>
                <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>Partager cette recette</Text>
                    <TouchableOpacity onPress={() => setShareVisible(false)}>
                        <Ionicons name="close-circle-outline" size={28} color="#888" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBar}>
                   <Ionicons name="search" size={18} color="#888" style={{marginRight:8}} />
                   <TextInput 
                      style={styles.searchInput}
                      placeholder="Rechercher un ami..."
                      placeholderTextColor="#888"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                   />
                </View>

                <FlatList 
                   data={filteredFriends}
                   keyExtractor={item => item.id_utilisateur.toString()}
                   showsVerticalScrollIndicator={false}
                   renderItem={({item}) => {
                     const isSelected = selectedFriends.includes(item.id_utilisateur);
                     return (
                       <TouchableOpacity style={styles.friendRow} onPress={() => handleToggleFriend(item.id_utilisateur)}>
                          <Image source={{uri: item.path_pp}} style={styles.friendAvatar} />
                          <Text style={styles.friendName}>{item.prenom} {item.nom}</Text>
                          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                              {isSelected && <Ionicons name="checkmark" size={14} color="#000" />}
                          </View>
                       </TouchableOpacity>
                     )
                   }}
                   contentContainerStyle={{ paddingBottom: 100 }}
                   ListEmptyComponent={<Text style={styles.emptyText}>Aucun ami trouvé.</Text>}
                />

                {selectedFriends.length > 0 && (
                  <View style={styles.floatingActionContainer}>
                    <TouchableOpacity style={styles.shareActionBtn} onPress={handleShare}>
                        <Text style={styles.shareActionBtnText}>Partager à {selectedFriends.length} ami(s)</Text>
                    </TouchableOpacity>
                  </View>
                )}
            </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
  },
  friendName: {
    flex: 1,
    marginLeft: 14,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#A3FF3D',
    borderColor: '#A3FF3D',
  },
  floatingActionContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
  },
  shareActionBtn: {
    backgroundColor: '#A3FF3D',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareActionBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  }
});
