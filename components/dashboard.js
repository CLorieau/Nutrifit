import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";

import { useChat } from "../ChatContext";
import { usePlayer } from "../PlayerContext";
import { getPlanningByDate } from "../api/calendrier";
import { getRecette } from "../api/recettes";
import { getExercice } from "../api/exercices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthContext from "../AuthContext";
import { useBlindMode } from "../BlindModeContext";

export default function Dashboard({ navigation }) {
  const insets = useSafeAreaInsets();
  const { openChat } = useChat();
  const { isPlaying, play, pause, progress } = usePlayer();
  const { user } = useContext(AuthContext);
  const { blindMode } = useBlindMode();

  const [todaysPlanning, setTodaysPlanning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closestTraining, setClosestTraining] = useState(null);

  // KPIs
  const [eatenCalories, setEatenCalories] = useState(0);
  const [burnedCalories, setBurnedCalories] = useState(0);
  const [workoutStats, setWorkoutStats] = useState({ done: 0, total: 0 });
  const [allMealsChecked, setAllMealsChecked] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Greeting : show only on first daily open, with fade-out transition
  useEffect(() => {
    const checkGreeting = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const lastSeen = await AsyncStorage.getItem("last_seen_date");
      if (lastSeen !== today) {
        setShowGreeting(true);
        await AsyncStorage.setItem("last_seen_date", today);
        // After 3s, fade out greeting and fade in logo
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }).start(() => {
            setShowGreeting(false);
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }).start();
          });
        }, 3000);
      }
    };
    checkGreeting();
  }, []);

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

          // B. Eaten Calories (AsyncStorage checked meals)
          let eaten = 0;
          if (fullPlanning.repas) {
            for (const r of fullPlanning.repas) {
              const key = `meal_done_${localISOTime}_${r.categorie}_${r.id_recette || "none"}`;
              const val = await AsyncStorage.getItem(key);
              if (val === "true") {
                eaten += r.recette?.calories || 0;
              }
            }
          }
          setEatenCalories(eaten);

          // Check si tous les repas ont été validés
          const totalMeals = fullPlanning.repas?.length || 0;
          let checkedCount = 0;
          if (fullPlanning.repas) {
            for (const r of fullPlanning.repas) {
              const key = `meal_done_${localISOTime}_${r.categorie}_${r.id_recette || "none"}`;
              const val = await AsyncStorage.getItem(key);
              if (val === "true") checkedCount++;
            }
          }
          setAllMealsChecked(totalMeals > 0 && checkedCount === totalMeals);

          // C. Burned Calories (AsyncStorage)
          const dateKey = `workout_done_${localISOTime}`;
          const isDone = await AsyncStorage.getItem(dateKey);

          let totalW = 0;
          if (fullPlanning.seances) {
            totalW = fullPlanning.seances.length;
          }
          let doneW = isDone === "true" && totalW > 0 ? 1 : 0;
          setWorkoutStats({ done: doneW, total: totalW });

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
    }
  };

  const openSessionDetails = () => {
    if (!closestTraining) return;
    const params = {};
    if (closestTraining.id_seance) {
      params.seanceId = closestTraining.id_seance;
    } else if (closestTraining.id_exercice) {
      params.filterIds = [closestTraining.id_exercice];
    }
    if (Object.keys(params).length > 0) {
      navigation.navigate("Training", params);
    }
  };

  // Helpers
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const firstName = user?.prenom || user?.nom || "";

  // Couleur par catégorie de repas
  const categoryColor = {
    petit_dejeuner: "#FBBF24",
    dejeuner: "#34D399",
    collation: "#818CF8",
    diner: "#F87171",
  };
  const categoryIcon = {
    petit_dejeuner: "coffee",
    dejeuner: "silverware-fork-knife",
    collation: "apple",
    diner: "moon-waning-crescent",
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: 110,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER — Greeting or Logo with fade transition */}
      <View style={styles.header}>
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            height: 50,
            justifyContent: "center",
          }}
        >
          {showGreeting && firstName ? (
            <View style={{ height: 50, justifyContent: "center" }}>
              <Text style={styles.greetingText}>Hello, {firstName} 👋</Text>
              <Text style={styles.greetingDate}>{todayLabel}</Text>
            </View>
          ) : (
            <Image source={require("../assets/logo.png")} style={styles.logo} />
          )}
        </Animated.View>
        <TouchableOpacity style={styles.addButton} onPress={openChat}>
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* CARD 1 — WORKOUT */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Workout</Text>

        {closestTraining ? (
          <View style={styles.trainingCard}>
            {/* Badge + titre */}
            <View style={styles.tcHeader}>
              <View style={styles.tcBadge}>
                <Text style={styles.tcBadgeText}>TODAY</Text>
              </View>
              <View
                style={[
                  styles.tcWorkoutPill,
                  {
                    backgroundColor:
                      workoutStats.done > 0
                        ? "rgba(163,255,61,0.12)"
                        : "rgba(255,255,255,0.06)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tcWorkoutPillText,
                    { color: workoutStats.done > 0 ? "#A3FF3D" : "#666" },
                  ]}
                >
                  {workoutStats.done}/{workoutStats.total} séance
                  {workoutStats.total > 1 ? "s" : ""}
                </Text>
              </View>
            </View>

            <Text style={styles.tcTitle} numberOfLines={1}>
              {closestTraining?.exercice?.nom_exercice ||
                closestTraining?.nom ||
                "Today's workout"}
            </Text>

            {/* Métriques */}
            <View style={styles.tcMetrics}>
              <View style={styles.tcMetricItem}>
                <MaterialCommunityIcons name="fire" size={16} color="#FF6432" />
                {!blindMode && (
                  <Text style={styles.tcMetricValue}>
                    {burnedCalories > 0 ? burnedCalories : 300}
                  </Text>
                )}
                <Text style={styles.tcMetricLabel}>{blindMode ? "Workout" : "kcal"}</Text>
              </View>
              <View style={styles.tcMetricDivider} />
              <View style={styles.tcMetricItem}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={16}
                  color="#9CA3AF"
                />
                <Text style={styles.tcMetricValue}>
                  {closestTraining.duree || 45}
                </Text>
                <Text style={styles.tcMetricLabel}>min</Text>
              </View>
              <View style={styles.tcMetricDivider} />
              <View style={styles.tcMetricItem}>
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={16}
                  color="#9CA3AF"
                />
                <Text style={styles.tcMetricValue}>
                  {closestTraining.nb_exercices || "—"}
                </Text>
                <Text style={styles.tcMetricLabel}>exercises</Text>
              </View>
            </View>

            {/* Barre progression */}
            {progress > 0 && (
              <View style={styles.tcProgressBg}>
                <View
                  style={[
                    styles.tcProgressFill,
                    { width: `${progress * 100}%` },
                  ]}
                />
              </View>
            )}

            {/* Bouton démarrer */}
            <TouchableOpacity
              style={styles.tcStartBtn}
              activeOpacity={0.85}
              onPress={() => {
                if (closestTraining.id_seance) {
                  navigation.navigate("Training", {
                    seanceId: closestTraining.id_seance,
                  });
                } else {
                  navigation.navigate("Training");
                }
              }}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={18}
                color="#000"
              />
              <Text style={styles.tcStartBtnText}>
                {isPlaying ? "Pause" : "Start"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Rest Day
          <View style={[styles.trainingCard, styles.tcRestDay]}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>💤</Text>
            <Text style={styles.tcRestTitle}>Rest day</Text>
            <Text style={styles.tcRestSub}>
              No workout planned today. Take it easy!
            </Text>
          </View>
        )}
      </View>

      {/* CARD 2 — GENERAL VIEW */}
      {!blindMode && (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>General View</Text>

        <View style={styles.generalCard}>
          {/* En-tête : Calories restantes */}
          <View style={styles.gvHeader}>
            <View>
              <Text style={styles.gvRemaining}>
                {Math.max(0, 2200 - eatenCalories)}
                <Text style={styles.gvRemainingUnit}> kcal</Text>
              </Text>
              <Text style={styles.gvRemainingLabel}>remaining today</Text>
            </View>
            <View style={styles.gvBadge}>
              <Text style={styles.gvBadgeText}>
                {Math.round((eatenCalories / 2200) * 100)}%
              </Text>
            </View>
          </View>

          {/* Ligne séparatrice */}
          <View style={styles.gvDivider} />

          {/* Barre Mangées */}
          <View style={styles.gvRow}>
            <View style={styles.gvRowLeft}>
              <View style={[styles.gvDot, { backgroundColor: "#A3FF3D" }]} />
              <Text style={styles.gvRowLabel}>Eaten</Text>
            </View>
            <Text style={styles.gvRowValue}>
              {eatenCalories}
              <Text style={styles.gvRowUnit}> / 2200 kcal</Text>
            </Text>
          </View>
          <View style={styles.gvBarBg}>
            <View
              style={[
                styles.gvBarFill,
                {
                  width: `${Math.min(100, (eatenCalories / 2200) * 100)}%`,
                  backgroundColor: "#A3FF3D",
                },
              ]}
            />
          </View>

          {/* Barre Brûlées */}
          <View style={[styles.gvRow, { marginTop: 14 }]}>
            <View style={styles.gvRowLeft}>
              <View style={[styles.gvDot, { backgroundColor: "#FF6432" }]} />
              <Text style={styles.gvRowLabel}>Brûlées</Text>
            </View>
            <Text style={styles.gvRowValue}>
              {burnedCalories}
              <Text style={styles.gvRowUnit}> / 430 kcal</Text>
            </Text>
          </View>
          <View style={styles.gvBarBg}>
            <View
              style={[
                styles.gvBarFill,
                {
                  width: `${Math.min(100, (burnedCalories / 430) * 100)}%`,
                  backgroundColor: "#FF6432",
                },
              ]}
            />
          </View>

          {/* Banderole bonus */}
          {allMealsChecked && eatenCalories < 2200 && (
            <View style={styles.bonusBanner}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={15}
                color="#000"
              />
              <Text style={styles.bonusBannerText}>
                You still have{" "}
                <Text style={{ fontWeight: "800" }}>
                  {2200 - eatenCalories} kcal
                </Text>{" "}
                to spend freely!
              </Text>
            </View>
          )}
        </View>
      </View>
      )}

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Meals of the day</Text>

        {todaysPlanning?.repas?.length > 0 ? (
          <View style={styles.mealsContainer}>
            {todaysPlanning.repas.map((meal, index) => {
              const nom = meal.recette?.nom_recette || meal.categorie || "Meal";
              const calories = meal.recette?.calories || 0;
              const cat = meal.categorie || "dejeuner";
              const color = categoryColor[cat] || "#A3FF3D";
              const icon = categoryIcon[cat] || "silverware-fork-knife";

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.mealRow,
                    index < todaysPlanning.repas.length - 1 &&
                      styles.mealRowBorder,
                  ]}
                  onPress={() =>
                    navigation.navigate("RecipeDetail", {
                      recipeId: meal.id_recette,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.mealIconBox,
                      { backgroundColor: `${color}18` },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={icon}
                      size={18}
                      color={color}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.mealRowName} numberOfLines={1}>
                      {nom}
                    </Text>
                    <Text style={styles.mealRowTime}>
                      {meal.heure_debut || "—"}
                    </Text>
                  </View>
                  {!blindMode && (
                    <Text style={[styles.mealRowCal, { color }]}>
                      {calories} kcal
                    </Text>
                  )}
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#C4C4C4"
                    style={{ marginLeft: 6 }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.mealsEmpty}>
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={28}
              color="#333"
            />
            <Text style={styles.mealsEmptyText}>No meals planned today</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

/* --- STYLES --- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F9",
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0A0A0A",
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  greetingDate: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
    fontWeight: "500",
  },
  logo: {
    width: 150,
    height: 50,
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

  // SECTIONS
  sectionContainer: {
    marginHorizontal: 25,
    marginBottom: 22,
  },
  sectionTitle: {
    color: "#0A0A0A",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  // TRAINING CARD (dark, no image)
  trainingCard: {
    backgroundColor: "#0A0A0A",
    borderRadius: 22,
    padding: 20,
  },
  tcHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tcBadge: {
    backgroundColor: "#A3FF3D",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tcBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 0.5,
  },
  tcWorkoutPill: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tcWorkoutPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  tcTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  tcMetrics: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tcMetricItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  tcMetricValue: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  tcMetricLabel: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  tcMetricDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#2A2A2A",
  },
  tcProgressBg: {
    height: 4,
    backgroundColor: "#1E1E1E",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 16,
  },
  tcProgressFill: {
    height: "100%",
    backgroundColor: "#A3FF3D",
    borderRadius: 2,
  },
  tcStartBtn: {
    backgroundColor: "#A3FF3D",
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  tcStartBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
  },
  tcRestDay: {
    alignItems: "center",
    paddingVertical: 32,
  },
  tcRestTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  tcRestSub: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 10,
  },

  // GENERAL VIEW
  generalCard: {
    backgroundColor: "#0A0A0A",
    borderRadius: 20,
    padding: 20,
  },
  gvHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  gvRemaining: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
  },
  gvRemainingUnit: {
    fontSize: 18,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0,
  },
  gvRemainingLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  gvBadge: {
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  gvBadgeText: {
    color: "#A3FF3D",
    fontWeight: "800",
    fontSize: 14,
  },
  gvDivider: {
    height: 1,
    backgroundColor: "#1E1E1E",
    marginBottom: 16,
  },
  gvRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  gvRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  gvDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gvRowLabel: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "500",
  },
  gvRowValue: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  gvRowUnit: {
    color: "#555",
    fontWeight: "400",
  },
  gvBarBg: {
    height: 6,
    backgroundColor: "#1E1E1E",
    borderRadius: 3,
    overflow: "hidden",
  },
  gvBarFill: {
    height: "100%",
    borderRadius: 3,
  },

  // BONUS BANNER
  bonusBanner: {
    marginTop: 14,
    backgroundColor: "#A3FF3D",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 8,
  },
  bonusBannerText: {
    flex: 1,
    color: "#000",
    fontSize: 13,
    fontWeight: "600",
  },

  // MEALS LIST
  mealsContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  mealRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  mealRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  mealIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  mealRowName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  mealRowTime: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  mealRowCal: {
    fontSize: 14,
    fontWeight: "700",
  },
  mealsEmpty: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    gap: 10,
  },
  mealsEmptyText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
});
