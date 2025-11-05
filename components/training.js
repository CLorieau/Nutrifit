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
import { useNavigation } from "@react-navigation/native"; // ✅ pour naviguer

export default function Training() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation(); // ✅ accès à la navigation

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const workoutDone = 1;
  const workoutTotal = 2;
  const workoutRatio = workoutDone / workoutTotal;

  // --- Animation de la barre de progression ---
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 1) return 1;
          return prev + 0.01;
        });
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // --- Gestion des boutons Play/Pause/Restart ---
  const handlePress = () => {
    // 👉 quand on clique sur play/pause, on va à TrainingDetail
    navigation.navigate("TrainingDetail");
  };

  const getIconName = () => {
    if (progress >= 1) return "refresh-circle"; // flèche épaisse
    return isPlaying ? "pause" : "play";
  };

  const recommendations = [
    {
      id: "1",
      title: "Pull up",
      time: "15:00 min",
      calories: 120,
      type: "Cardio",
      image:
        "https://cdn.pixabay.com/photo/2016/03/27/19/50/pull-up-1284787_1280.jpg",
    },
    {
      id: "2",
      title: "Sit Up",
      time: "15:00 min",
      calories: 120,
      type: "Cardio",
      image:
        "https://cdn.pixabay.com/photo/2016/11/29/06/18/abdominal-1867728_1280.jpg",
    },
    {
      id: "3",
      title: "Biceps curl",
      time: "15:00 min",
      calories: 120,
      type: "Cardio",
      image:
        "https://cdn.pixabay.com/photo/2016/03/27/21/16/bodybuilder-1284570_1280.jpg",
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {/* --- HEADER --- */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.title}>Today's activities :</Text>
          <Text style={styles.subtitle}>Body Weight</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* --- CARTE PRINCIPALE --- */}
      <View style={styles.mainCard}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1594737625785-cbdb6993a47e?q=80&w=800",
          }}
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
        data={recommendations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("TrainingDetail")} // ✅ clic sur un exercice
            activeOpacity={0.8}
          >
            <View style={styles.exerciseCard}>
              <Image source={{ uri: item.image }} style={styles.exerciseImage} />
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseTitle}>{item.title}</Text>
                <Text style={styles.exerciseMeta}>
                  {item.time} | {item.calories} kcal
                </Text>
                <Text style={styles.exerciseMeta}>Calories Burned</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.type}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
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
