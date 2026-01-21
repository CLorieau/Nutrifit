import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getExercice } from "../api/exercices";

export default function TrainingDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { exerciseId } = route.params || {};

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExerciseDetail = async () => {
      if (!exerciseId) {
        setLoading(false);
        return;
      }
      try {
        const response = await getExercice(exerciseId);
        setExercise(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement de l'exercice:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetail();
  }, [exerciseId]);

  const parseMuscles = (musclesJSON) => {
    if (!musclesJSON) return "Non spécifié";
    try {
      const parsed = JSON.parse(musclesJSON);
      return Array.isArray(parsed) ? parsed.join(", ") : parsed;
    } catch (e) {
      return musclesJSON;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#A3FF3D" />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Exercice introuvable.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: "blue" }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* --- HEADER --- */}
      <View style={styles.headerCard}>
        <Image
          source={{
            uri:
              exercise.image_path ||
              "https://images.unsplash.com/photo-1594737625785-cbdb6993a47e?q=80&w=800",
          }}
          style={styles.headerImage}
        />

        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{exercise.nom_exercice}</Text>
            <Text style={styles.headerSubtitle}>
              {exercise.type_exercice} • {exercise.materiel ? exercise.materiel.replace(/_/g, " ") : ""}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {/* --- INFO ROW --- */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="flame-outline" size={24} color="#A3FF3D" />
            <Text style={styles.statValue}>
              {exercise.calories_brulees || "-"} kcal
            </Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="repeat-outline" size={24} color="#A3FF3D" />
            <Text style={styles.statValue}>
              {exercise.nombre_series || "-"}
            </Text>
            <Text style={styles.statLabel}>Séries</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={24} color="#A3FF3D" />
            <Text style={styles.statValue}>
              {exercise.temps_recuperation || "-"}s
            </Text>
            <Text style={styles.statLabel}>Repos</Text>
          </View>
        </View>

        {/* --- DESCRIPTION --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {exercise.description_exercice || "Aucune description disponible."}
          </Text>
        </View>

        {/* --- MUSCLES --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Muscles ciblés</Text>
          <View style={styles.tagContainer}>
            {parseMuscles(exercise.muscle_cible)
              .split(", ")
              .map((muscle, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{muscle}</Text>
                </View>
              ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { justifyContent: "center", alignItems: "center" },
  headerCard: {
    height: 300,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    position: "relative",
  },
  headerImage: { width: "100%", height: "100%" },
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: { marginBottom: 10 },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 5,
  },
  headerSubtitle: {
    color: "#ddd",
    fontSize: 16,
    textTransform: "capitalize",
  },
  body: { padding: 25 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1c1c1e",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    elevation: 5,
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 5,
  },
  statLabel: { color: "#888", fontSize: 12 },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#333",
  },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: "#A3FF3D",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: { fontWeight: "600", color: "#000" },
});
