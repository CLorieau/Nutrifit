import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Progress from "react-native-progress";
import { useNavigation, useRoute } from "@react-navigation/native"; // ✅ pour naviguer
import { useChat } from "../ChatContext";
import { getExercices } from "../api/exercices";
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

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const workoutDone = 1;
  const workoutTotal = 2;
  const workoutRatio = workoutDone / workoutTotal;

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

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {/* --- HEADER --- */}
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
        <TouchableOpacity style={styles.addButton} onPress={openChat}>
          <Ionicons name="add" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* --- CARTE PRINCIPALE --- */}
      <View style={styles.mainCard}>
        <Image
          source={require("../assets/welcome_page_pic.jpg")}
          style={styles.cardImage}
        />
        <View style={styles.overlay}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text style={styles.cardTitle}>Today's activities :</Text>
              <Text style={styles.cardSubtitle}>Body Weight</Text>
            </View>

            {/* Cercle Workout */}
            <View style={styles.circleWrapper}>
              <Progress.Circle
                size={70}
                progress={workoutRatio}
                color="#fff"
                unfilledColor="rgba(255,255,255,0.3)"
                thickness={3}
                borderWidth={0}
              />
              <View style={styles.circleCenter}>
                <Text style={styles.circleText}>
                  {workoutDone}/{workoutTotal}
                </Text>
                <Text style={styles.circleSub}>Workout</Text>
              </View>
            </View>
          </View>

          {/* Ligne Play + Temps alignée */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 25,
            }}
          >
            <TouchableOpacity onPress={handlePress} style={styles.playButton}>
              <Ionicons
                name={getIconName()}
                size={28}
                color="#fff"
                style={{ transform: [{ scaleX: 1.05 }] }}
              />
            </TouchableOpacity>

            <View style={{ alignItems: "flex-end", marginRight: 5 }}>
              <Text style={styles.timeValue}>1h30</Text>
              <Text style={styles.timeLabel}>Time</Text>
            </View>
          </View>

          {/* Barre de progression */}
          <Progress.Bar
            progress={progress}
            width={null}
            height={4}
            color="#A3FF3D"
            unfilledColor="#222"
            borderWidth={0}
            style={{ marginTop: 15 }}
          />
        </View>
      </View>

      {/* --- RECOMMANDATIONS --- */}
      <Text style={styles.sectionTitle}>Recommendation</Text>

      <FlatList
        data={exercises}
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
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
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
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  mainCard: {
    position: "relative",
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 25,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  cardSubtitle: {
    color: "#ddd",
    fontSize: 14,
    marginTop: 2,
  },
  circleWrapper: {
    position: "relative",
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  circleCenter: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  circleText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  circleSub: {
    color: "#ccc",
    fontSize: 12,
  },
  playButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  timeValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  timeLabel: {
    color: "#bbb",
    fontSize: 12,
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
});
