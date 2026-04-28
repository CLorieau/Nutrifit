import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Progress from "react-native-progress";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native"; // ✅ pour naviguer
import { useChat } from "../ChatContext";
import { getExercices, getExercice } from "../api/exercices";
import { getPlanningByDate } from "../api/calendrier";
import { getSeance } from "../api/seances";
import { usePlayer } from "../PlayerContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const parseMuscles = (muscles) => {
  if (!muscles) return "Muscles";
  try {
    return JSON.parse(muscles).join(", ");
  } catch (e) {
    return muscles;
  }
};

export default function Training() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation(); // ✅ accès à la navigation
  const route = useRoute();
  const { openChat } = useChat();
  const { isPlaying, play, pause, progress, setTraining } = usePlayer();

  // Fonctionnalité 4 : Disclaimer avant de démarrer la séance
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [pendingNavParams, setPendingNavParams] = useState(null);

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  // New states for dashboard-like behavior
  const [closestTraining, setClosestTraining] = useState(null);
  const [workoutStats, setWorkoutStats] = useState({ done: 0, total: 0 });
  const [burnedCalories, setBurnedCalories] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const fetchTodayData = async () => {
        try {
          const today = new Date();
          const offset = today.getTimezoneOffset() * 60000;
          const localISOTime = new Date(today - offset)
            .toISOString()
            .slice(0, 10);
          const userId = 180001;

          const basicData = await getPlanningByDate(userId, localISOTime);

          let enrichedSeances = [];
          if (basicData.seances) {
            enrichedSeances = await Promise.all(
              basicData.seances.map(async (s) => {
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
          }

          if (enrichedSeances.length > 0) {
            setClosestTraining(enrichedSeances[0]);
          } else {
            setClosestTraining(null);
          }

          const dateKey = `workout_done_${localISOTime}`;
          const isDone = await AsyncStorage.getItem(dateKey);

          const totalW = enrichedSeances.length;
          const doneW = isDone === "true" && totalW > 0 ? 1 : 0;
          setWorkoutStats({ done: doneW, total: totalW });

          if (isDone === "true") {
            let burned = 0;
            if (enrichedSeances) {
              enrichedSeances.forEach((s) => {
                burned += s.exercice?.calories_brulees || 300;
              });
            }
            setBurnedCalories(burned);
          } else {
            setBurnedCalories(0);
          }
        } catch (e) {
          console.log("Error training fetch", e);
        }
      };

      fetchTodayData();
    }, []),
  );

  // Auto-start if requested
  useEffect(() => {
    if (route.params?.autoStart) {
      play();
    }
  }, [route.params?.autoStart]);

  const filterIds = route.params?.filterIds; // Array of IDs if filtering
  const seanceId = route.params?.seanceId; // Session ID if specific session

  // Logic needed for completion?

  // Logic needed for completion?
  // If progress >= 1, save "Done".
  useEffect(() => {
    const checkCompletion = async () => {
      if (progress >= 1) {
        try {
          const today = new Date();
          const offset = today.getTimezoneOffset() * 60000;
          const localISOTime = new Date(today - offset)
            .toISOString()
            .slice(0, 10);
          await AsyncStorage.setItem(`workout_done_${localISOTime}`, "true");
          console.log("Workout saved as done!");
        } catch (e) {
          console.log("Error saving workout", e);
        }
      }
    };
    checkCompletion();
  }, [progress]);

  // const [isPlaying, setIsPlaying] = useState(false); REMOVED
  // const [progress, setProgress] = useState(0); REMOVED
  const workoutDone = workoutStats.done;
  const workoutTotal = workoutStats.total || 1;
  const workoutRatio = workoutStats.total > 0 ? workoutDone / workoutTotal : 0;

  // --- Animation de la barre de progression ---
  // REMOVED local interval logic, handled in PlayerContext

  // --- Chargement des exercices depuis l'API ---
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        let data = [];

        if (seanceId) {
          // Fetch specific session details
          const res = await getSeance(seanceId);
          // res.data contains { id_seance, nom, exercices: [ { id_exercice, exercice: {...}, series, ... } ] }
          // specific session details need to be merged?
          // For the list, we mainly need the exercise info.
          // We flat map to get the exercise objects
          if (res.data.exercices) {
            data = res.data.exercices.map((link) => ({
              ...link.exercice,
              // We can attach session specific details here if needed later
              sessions_series: link.series,
              sessions_reps: link.repetitions,
              sessions_rest: link.temps_recuperation,
            }));
          }
        } else {
          const response = await getExercices();
          data = response.data;
          // If we have a filter, keep only those
          if (filterIds && filterIds.length > 0) {
            const setIds = new Set(filterIds);
            data = data.filter((e) => setIds.has(e.id_exercice));
          }
        }

        setExercises(data);
      } catch (error) {
        console.error("Erreur lors du chargement des exercices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [filterIds, seanceId]);

  // --- Gestion des boutons Play/Pause/Restart ---
  const handlePress = () => {
    // 👉 quand on clique sur play/pause
    if (isPlaying) {
      pause();
    } else {
      if (progress >= 1) {
        // Reset?
        // reset(); // If we export reset logic.
        // For now just play
        play();
      } else {
        play();
      }
    }
  };

  const getIconName = () => {
    if (progress >= 1) return "refresh-circle"; // flèche épaisse
    return isPlaying ? "pause" : "play";
  };

  const openActiveWorkout = () => {
    if (!closestTraining) return;
    // Fonctionnalité 4 : intercepter et afficher le disclaimer avant de lancer
    const params = closestTraining.id_seance
      ? { seanceId: closestTraining.id_seance }
      : { seanceId: 0 };
    setPendingNavParams(params);
    setShowDisclaimer(true);
  };

  const confirmStartWorkout = () => {
    setShowDisclaimer(false);
    if (pendingNavParams) {
      navigation.navigate("ActiveWorkout", pendingNavParams);
    }
  };

  return (
    <>
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: 100,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER LOGO + IA */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <Image
          source={require("../assets/logo.png")}
          style={{ width: 150, height: 50, resizeMode: "contain" }}
        />
        <TouchableOpacity style={styles.addButton} onPress={openChat}>
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* --- TITLE --- */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.title}>Today's activities :</Text>
          <Text style={styles.subtitle}>
            {seanceId
              ? "Session details"
              : filterIds
                ? "Planned Session"
                : "Body Weight"}
          </Text>
        </View>
      </View>

      {/* --- CARTE PRINCIPALE --- */}
      <TouchableOpacity
        style={styles.trainingCard}
        onPress={openActiveWorkout}
        activeOpacity={0.9}
      >
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
                onPress={openActiveWorkout}
                style={styles.playButton}
              >
                <Ionicons name="play" size={24} color="#fff" />
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
            <Text style={styles.workoutText}>
              {workoutStats.done}/{workoutStats.total}
            </Text>
            <Text style={styles.workoutLabel}>Workout</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* --- RECOMMANDATIONS --- */}
      <Text style={styles.sectionTitle}>Recommendation</Text>

      <FlatList
        data={exercises}
        scrollEnabled={false}
        keyExtractor={(item) => item.id_exercice.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("TrainingDetail", {
                exerciseId: item.id_exercice,
              })
            } // ✅ clic sur un exercice
            activeOpacity={0.8}
          >
            <View style={styles.exerciseCard}>
              <Image
                source={{
                  uri:
                    item.image_path ||
                    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=150",
                }}
                style={styles.exerciseImage}
              />
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseTitle}>{item.nom_exercice}</Text>
                <Text style={styles.exerciseMeta}>
                  {item.materiel ? item.materiel.replace(/_/g, " ") : "N/A"}
                </Text>
                <Text style={styles.exerciseMeta} numberOfLines={1}>
                  {parseMuscles(item.muscle_cible)}
                </Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  {item.type_exercice || "Exercise"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading && (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No exercises found.
            </Text>
          )
        }
      />
    </ScrollView>

    {/* Fonctionnalité 4 : Modale d'avertissement avant séance */}
    <Modal visible={showDisclaimer} transparent animationType="slide">
      <View style={styles.disclaimerOverlay}>
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerEmoji}>⚠️</Text>
          <Text style={styles.disclaimerTitle}>Before starting</Text>

          <View style={styles.disclaimerItem}>
            <Ionicons name="ear-outline" size={20} color="#A3FF3D" style={{ marginTop: 2 }} />
            <Text style={styles.disclaimerText}>
              Listen to your body. If you feel abnormal pain, stop the exercise immediately.
            </Text>
          </View>

          <View style={styles.disclaimerItem}>
            <Ionicons name="flame-outline" size={20} color="#A3FF3D" style={{ marginTop: 2 }} />
            <Text style={styles.disclaimerText}>
              Don't forget to warm up before starting!
            </Text>
          </View>

          <View style={styles.disclaimerItem}>
            <Ionicons name="water-outline" size={20} color="#A3FF3D" style={{ marginTop: 2 }} />
            <Text style={styles.disclaimerText}>
              Stay hydrated during the effort.
            </Text>
          </View>

          <TouchableOpacity style={styles.disclaimerBtn} onPress={confirmStartWorkout} activeOpacity={0.85}>
            <Text style={styles.disclaimerBtnText}>Understood — Start 💪</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.disclaimerCancel} onPress={() => setShowDisclaimer(false)}>
            <Text style={styles.disclaimerCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 25,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#000",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  // TRAINING CARD (Identique Dashboard)
  trainingCard: {
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 10,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 1,
  },
  exerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  exerciseInfo: { flex: 1 },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  exerciseMeta: { fontSize: 12, color: "#777" },
  tag: {
    backgroundColor: "#A3FF3D",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: { fontSize: 12, fontWeight: "600", color: "#000" },

  // Fonctionnalité 4 : Disclaimer styles
  disclaimerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  disclaimerBox: {
    backgroundColor: "#0A0A0A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 36,
  },
  disclaimerEmoji: {
    fontSize: 40,
    textAlign: "center",
    marginBottom: 12,
  },
  disclaimerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  disclaimerItem: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  disclaimerText: {
    flex: 1,
    color: "#9CA3AF",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
  },
  disclaimerBtn: {
    backgroundColor: "#A3FF3D",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  disclaimerBtnText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "800",
  },
  disclaimerCancel: {
    alignItems: "center",
    paddingVertical: 8,
  },
  disclaimerCancelText: {
    color: "#555",
    fontSize: 15,
    fontWeight: "600",
  },
});
