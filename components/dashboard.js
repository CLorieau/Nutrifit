import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";

import { useChat } from "../ChatContext";
import { usePlayer } from "../PlayerContext";
import { getPlanningByDate } from "../api/calendrier";
import { getRecette } from "../api/recettes";
import { getExercice } from "../api/exercices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function Dashboard({ navigation }) {
  const { openChat } = useChat();
  const { isPlaying, play, pause, progress } = usePlayer();
  // const [progress, setProgress] = useState(0); // REMOVED local state

  const [todaysPlanning, setTodaysPlanning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closestTraining, setClosestTraining] = useState(null);

  // KPIs
  const [eatenCalories, setEatenCalories] = useState(0);
  const [burnedCalories, setBurnedCalories] = useState(0);

  // Fetch Data on Focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const today = new Date();
          const offset = today.getTimezoneOffset() * 60000;
          const localISOTime = new Date(today - offset)
            .toISOString()
            .slice(0, 10);

          const userId = 180001;
          const basicData = await getPlanningByDate(userId, localISOTime);

          // --- ENRICH DATA (Double Fetch) ---

          // 1. Enrich Meals
          const enrichedRepas = await Promise.all(
            (basicData.repas || []).map(async (r) => {
              if (r.id_recette) {
                try {
                  const recRes = await getRecette(r.id_recette);
                  return { ...r, recette: recRes.data };
                } catch (err) {
                  return r;
                }
              }
              return r;
            }),
          );

          // 2. Enrich Workouts
          const enrichedSeances = await Promise.all(
            (basicData.seances || []).map(async (s) => {
              if (s.id_exercice) {
                try {
                  const exoRes = await getExercice(s.id_exercice);
                  return { ...s, exercice: exoRes.data };
                } catch (err) {
                  return s;
                }
              }
              return s;
            }),
          );

          const fullPlanning = {
            ...basicData,
            repas: enrichedRepas,
            seances: enrichedSeances,
          };
          setTodaysPlanning(fullPlanning);

          // --- KPI & UI LOGIC ---

          // A. Closest Training
          if (fullPlanning.seances.length > 0) {
            setClosestTraining(fullPlanning.seances[0]);
          } else {
            setClosestTraining(null);
          }

          // B. Eaten Calories (Time-based)
          let eaten = 0;
          const now = new Date();
          const currentHour = now.getHours();
          const currentMin = now.getMinutes();

          const mealTimes = {
            petit_dejeuner: { h: 8, m: 30 },
            dejeuner: { h: 13, m: 30 },
            collation: { h: 16, m: 15 },
            diner: { h: 21, m: 0 },
          };

          const isPast = (mealTimeStr, category) => {
            let h, m;
            if (mealTimeStr) {
              [h, m] = mealTimeStr.split(":").map(Number);
            } else {
              if (!mealTimes[category]) return false;
              if (category === "petit_dejeuner") {
                h = 8;
                m = 0;
              } else if (category === "dejeuner") {
                h = 12;
                m = 30;
              } else if (category === "collation") {
                h = 16;
                m = 0;
              } else if (category === "diner") {
                h = 20;
                m = 0;
              } else return false;
            }
            if (currentHour > h) return true;
            if (currentHour === h && currentMin >= m) return true;
            return false;
          };

          if (fullPlanning.repas) {
            fullPlanning.repas.forEach((r) => {
              if (isPast(r.heure_debut, r.categorie)) {
                eaten += r.recette?.calories || 0;
              }
            });
          }
          setEatenCalories(eaten);

          // C. Burned Calories (AsyncStorage)
          const dateKey = `workout_done_${localISOTime}`;
          const isDone = await AsyncStorage.getItem(dateKey);
          if (isDone === "true") {
            let burned = 0;
            if (fullPlanning.seances) {
              fullPlanning.seances.forEach((s) => {
                burned += s.exercice?.calories_brulees || 300;
              });
            }
            setBurnedCalories(burned);
          } else {
            setBurnedCalories(0);
          }
        } catch (e) {
          console.log("Error dashboard fetch", e);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, []),
  );

  // Gestion du bouton play/pause
  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
      // Navigation vers Training (avec autostart si besoin)
      const params = { autoStart: true };
      if (closestTraining?.id_exercice) {
        params.exerciseId = closestTraining.id_exercice;
      }
      navigation.navigate("Training", params);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
        <TouchableOpacity style={styles.addButton} onPress={openChat}>
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* CARD 1 — TRAINING */}
      <View style={styles.trainingCard}>
        <Image
          source={require("../assets/welcome_page_pic.jpg")}
          style={styles.trainingImage}
        />
        <View style={styles.overlay}>
          {/* TITRES */}
          <View>
            <Text style={styles.trainingTitle}>Today's activities :</Text>
            {/* Utiliser le nom de l'exercice enrichi */}
            <Text style={styles.trainingSubtitle}>
              {closestTraining?.exercice?.nom_exercice || "Workout"}
            </Text>
          </View>

          {/* INFOS + PLAY + BARRE */}
          {closestTraining ? (
            <View style={styles.infoContainer}>
              <TouchableOpacity
                onPress={handlePlayPause}
                style={styles.playButton}
              >
                {isPlaying ? (
                  <Ionicons name="pause" size={24} color="#fff" />
                ) : (
                  <Ionicons name="play" size={24} color="#fff" />
                )}
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <View style={styles.infoBottom}>
                  <View>
                    <Text style={styles.trainingValue}>
                      {burnedCalories > 0 ? burnedCalories : 300} kcal
                    </Text>
                    <Text style={styles.trainingLabel}>Est. Calories</Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.trainingValue}>
                      {closestTraining.duree || 60} min
                    </Text>
                    <Text style={styles.trainingLabel}>Time</Text>
                  </View>
                </View>

                <View style={styles.progressWrapper}>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${progress * 100}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View
              style={{
                position: "absolute",
                inset: 0,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.6)",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>
                Rest Day
              </Text>
              <Text style={{ color: "#ccc", fontSize: 16 }}>
                No training scheduled today
              </Text>
            </View>
          )}

          {/* CERCLE WORKOUT */}
          <View style={styles.workoutCircle}>
            <Text style={styles.workoutText}>1/2</Text>
            <Text style={styles.workoutLabel}>Workout</Text>
          </View>
        </View>
      </View>

      {/* CARD 2 — GENERAL VIEW */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>General view</Text>

        <View style={styles.generalCard}>
          <View>
            <Text style={styles.infoText}>
              Calories eaten{" "}
              <Text style={styles.infoSub}>{eatenCalories}/2200 kcal</Text>
            </Text>
            <Text style={styles.infoText}>
              Calories burned{" "}
              <Text style={styles.infoSub}>{burnedCalories}/430 kcal</Text>
            </Text>
          </View>

          <View style={styles.circleContainer}>
            <Progress.Circle
              size={100}
              progress={Math.max(0, (2200 - eatenCalories) / 2200)}
              showsText={true}
              color="#A3FF3D"
              unfilledColor="#333"
              borderWidth={0}
              thickness={6}
              formatText={() => `${Math.max(0, 2200 - eatenCalories)}`}
            />
            <Text style={styles.remainingLabel}>Remaining</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Meals of the day</Text>

        {todaysPlanning?.repas?.map((meal, index) => {
          // 'meal' est enrichi avec 'recette'
          const nom = meal.recette?.nom_recette || meal.categorie;
          const calories = meal.recette?.calories || 0;
          const imageUrl =
            meal.recette?.image_url ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800";

          return (
            <TouchableOpacity
              key={index}
              style={styles.mealCard}
              onPress={() =>
                // Navigation avec ID
                navigation.navigate("RecipeDetail", {
                  recipeId: meal.id_recette,
                })
              }
            >
              <Image source={{ uri: imageUrl }} style={styles.mealImage} />
              <View style={styles.darkOverlay} />
              <View style={styles.mealOverlay}>
                <View>
                  <Text style={styles.mealTitle} numberOfLines={1}>
                    {nom}
                  </Text>
                  <Text style={styles.mealInfo}>
                    {meal.heure_debut || "??:??"} • {calories} kcal
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#fff" />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

/* --- STYLES --- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    marginTop: 50,
    marginBottom: 15,
  },
  logo: {
    width: 120,
    height: 40,
    resizeMode: "contain",
  },
  addButton: {
    backgroundColor: "#000",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // TRAINING CARD
  trainingCard: {
    marginHorizontal: 25,
    borderRadius: 20,
    overflow: "hidden",
    height: 210,
    marginBottom: 25,
  },
  trainingImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  trainingTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  trainingSubtitle: {
    color: "#ccc",
    fontSize: 14,
  },

  // NOUVEAU BLOC INFO
  infoContainer: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  playButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    width: 45,
    height: 45,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  infoBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  trainingValue: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  trainingLabel: {
    color: "#ccc",
    fontSize: 12,
  },
  progressWrapper: {
    width: "100%",
  },
  progressBarBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "#333",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#A3FF3D",
  },

  workoutCircle: {
    position: "absolute",
    right: 20,
    top: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  workoutText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  workoutLabel: {
    color: "#ccc",
    fontSize: 10,
  },

  // SECTIONS
  sectionContainer: {
    marginHorizontal: 25,
    marginBottom: 25,
  },
  sectionTitle: {
    color: "#000",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  // GENERAL VIEW
  generalCard: {
    backgroundColor: "#000",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoText: {
    color: "#ccc",
    fontSize: 13,
    marginTop: 6,
  },
  infoSub: {
    color: "#A3FF3D",
  },
  circleContainer: {
    alignItems: "center",
  },
  remainingLabel: {
    color: "#ccc",
    fontSize: 12,
    marginTop: 4,
  },

  // MEALS
  mealCard: {
    marginTop: 12,
    borderRadius: 15,
    overflow: "hidden",
    position: "relative",
  },
  mealImage: {
    width: "100%",
    height: 120,
  },
  darkOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  mealOverlay: {
    position: "absolute",
    bottom: 12,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  mealInfo: {
    color: "#ccc",
    fontSize: 13,
  },
});
