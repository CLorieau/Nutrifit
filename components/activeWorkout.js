import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Progress from "react-native-progress";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSeance } from "../api/seances";

// ─── Mock steps utilisés en fallback silencieux ───────────────────────────────
// TODO back-end : Implémenter GET /seances/{id} avec la relation exercices
// (cf. rapport technique). Cette liste sera supprimée dès que le back est prêt.
const MOCK_STEPS = [
  { type: "EXERCISE", title: "Push-ups",  duration: 30, subtitle: "Set 1/3 - 15 reps" },
  { type: "REST",     title: "Rest",       duration: 15, subtitle: "Breathe before set 2" },
  { type: "EXERCISE", title: "Push-ups",  duration: 30, subtitle: "Set 2/3 - 15 reps" },
  { type: "REST",     title: "Rest",       duration: 15, subtitle: "Breathe before set 3" },
  { type: "EXERCISE", title: "Push-ups",  duration: 30, subtitle: "Set 3/3 - 15 reps" },
  { type: "REST",     title: "Long rest",  duration: 45, subtitle: "Get ready" },
  { type: "EXERCISE", title: "Abs",        duration: 30, subtitle: "Set 1/1 - 20 reps" },
];

export default function ActiveWorkout() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();

  const { seanceId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Initialisation : Chargement des exercices de la séance
  useEffect(() => {
    const fetchSessionDetails = async () => {
      // Cas 1 : pas de seanceId → fallback silencieux (pas d'Alert, pas de goBack)
      if (!seanceId || seanceId === 0) {
        console.log("[ActiveWorkout] Aucun seanceId — fallback silencieux sur les données mock.");
        setSteps(MOCK_STEPS);
        setTimeLeft(MOCK_STEPS[0].duration);
        setLoading(false);
        return;
      }

      try {
        const res = await getSeance(seanceId);

        if (res.data && res.data.exercices && res.data.exercices.length > 0) {
          // Cas 2 : séance réelle disponible → générer les steps depuis la BDD
          const generatedSteps = [];

          res.data.exercices.forEach((link, index) => {
            const exo = link.exercice;
            const seriesCount = link.series || 1;
            const durationPerSeries = link.duree_serie || 30;
            const intraSeriesRest = link.repos_intra_serie || 30;

            for (let s = 1; s <= seriesCount; s++) {
              generatedSteps.push({
                type: "EXERCISE",
                title: exo.nom_exercice || "Exercise",
                duration: durationPerSeries,
                subtitle: `Set ${s}/${seriesCount} - ${link.repetitions || 10} reps`,
              });
              if (s < seriesCount) {
                generatedSteps.push({
                  type: "REST",
                  title: "Rest",
                  duration: intraSeriesRest,
                  subtitle: `Breathe before set ${s + 1}`,
                });
              }
            }

            const restTime = link.temps_recuperation || 0;
            if (restTime > 0 && index < res.data.exercices.length - 1) {
              generatedSteps.push({
                type: "REST",
                title: "Long rest",
                duration: restTime,
                subtitle: "Get ready for the next exercise!",
              });
            }
          });

          setSteps(generatedSteps);
          if (generatedSteps.length > 0) setTimeLeft(generatedSteps[0].duration);
        } else {
          // Cas 3 : séance vide en base → fallback silencieux
          console.log("[ActiveWorkout] Séance vide en base — fallback silencieux sur les données mock.");
          setSteps(MOCK_STEPS);
          setTimeLeft(MOCK_STEPS[0].duration);
        }
      } catch (e) {
        // Cas 4 : erreur réseau / 404 → fallback silencieux (pas d'Alert utilisateur)
        console.log("[ActiveWorkout] Erreur API (réseau ou 404) — fallback silencieux.", e?.message);
        setSteps(MOCK_STEPS);
        setTimeLeft(MOCK_STEPS[0].duration);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [seanceId]);

  // Logique du Timer
  useEffect(() => {
    if (loading || isFinished || steps.length === 0) return;

    let interval;
    if (!isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (!isPaused && timeLeft === 0) {
      handleNextStep();
    }

    return () => clearInterval(interval);
  }, [timeLeft, isPaused, loading, isFinished, steps]);

  const handleNextStep = async () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setTimeLeft(steps[nextIndex].duration);
    } else {
      setIsFinished(true);
      try {
        const today = new Date();
        const offset = today.getTimezoneOffset() * 60000;
        const localISOTime = new Date(today - offset).toISOString().slice(0, 10);
        await AsyncStorage.setItem(`workout_done_${localISOTime}`, "true");
      } catch (e) {
        console.log("Erreur sauvegarde workout_done", e);
      }
    }
  };

  const handleSkip = () => setTimeLeft(0);

  const currentStep = steps[currentStepIndex];

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#A3FF3D" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading workout...</Text>
      </View>
    );
  }

  if (isFinished) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }]}>
        <Ionicons name="trophy" size={80} color="#A3FF3D" style={{ marginBottom: 20 }} />
        <Text style={styles.titleTextFinished}>Workout Complete!</Text>
        <Text style={styles.subtitleFinished}>Stats updated on your Dashboard.</Text>
        <TouchableOpacity style={styles.finishBtn} onPress={() => navigation.navigate("Dashboard")}>
          <Text style={styles.finishBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentStep) return null;

  const isRest = currentStep.type === "REST";
  const progressPercent =
    currentStep.duration > 0
      ? (currentStep.duration - timeLeft) / currentStep.duration
      : 0;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, backgroundColor: isRest ? "#E5F9E0" : "#fff" }]}>
      {/* HEADER QUITTER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          Step {currentStepIndex + 1} / {steps.length}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* CONTENU CENTRAL */}
      <View style={styles.mainContent}>
        <Text style={styles.stepTitle}>{currentStep.title}</Text>
        <Text style={styles.stepSubtitle}>{currentStep.subtitle}</Text>

        <View style={styles.timerContainer}>
          <Progress.Circle
            size={220}
            progress={1 - progressPercent}
            color={isRest ? "#10B981" : "#A3FF3D"}
            unfilledColor={isRest ? "#C6F6D5" : "#F3F4F6"}
            borderWidth={0}
            thickness={14}
            strokeCap="round"
          />
          <View style={styles.timeLabelContainer}>
            <Text style={[styles.timeLabel, { color: isRest ? "#065F46" : "#000" }]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>
      </View>

      {/* CONTROLES */}
      <View style={[styles.controlsRow, { paddingBottom: Math.max(insets.bottom + 112, 50) }]}>
        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: isPaused ? "#000" : "#F3F4F6" }]}
          onPress={() => setIsPaused(!isPaused)}
        >
          <Ionicons name={isPaused ? "play" : "pause"} size={32} color={isPaused ? "#fff" : "#000"} />
        </TouchableOpacity>

        {(isRest || currentStep.type === "EXERCISE") && (
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: "#F3F4F6", opacity: isPaused ? 0.5 : 1 }]}
            onPress={handleSkip}
            disabled={isPaused}
          >
            <Ionicons name="play-skip-forward" size={32} color="#000" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 20,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center", justifyContent: "center",
  },
  headerText: { fontSize: 16, fontWeight: "600", color: "#4B5563" },
  mainContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
  stepTitle: { fontSize: 32, fontWeight: "800", color: "#111", textAlign: "center", marginBottom: 8 },
  stepSubtitle: { fontSize: 16, color: "#6B7280", textAlign: "center", marginBottom: 40 },
  timerContainer: { alignItems: "center", justifyContent: "center", position: "relative" },
  timeLabelContainer: { position: "absolute", alignItems: "center", justifyContent: "center" },
  timeLabel: { fontSize: 48, fontWeight: "700" },
  controlsRow: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", gap: 20, paddingBottom: 50,
  },
  controlBtn: {
    width: 70, height: 70, borderRadius: 35,
    alignItems: "center", justifyContent: "center",
    elevation: 3, shadowColor: "#000",
    shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10,
  },
  titleTextFinished: { fontSize: 32, fontWeight: "800", color: "#fff", textAlign: "center" },
  subtitleFinished: {
    fontSize: 16, color: "#A3FF3D", marginTop: 10,
    marginBottom: 40, textAlign: "center", paddingHorizontal: 20,
  },
  finishBtn: { backgroundColor: "#A3FF3D", paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30 },
  finishBtnText: { fontSize: 18, fontWeight: "700", color: "#000" },
});
