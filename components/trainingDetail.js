import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";

export default function TrainingDetail() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentExercise, setCurrentExercise] = useState("Pull up");

  const exercises = [
    { id: "1", title: "Pull up", type: "Pull" },
    { id: "2", title: "Sit Up", type: "Cardio" },
    { id: "3", title: "Biceps curl", type: "Pull" },
  ];

  const totalSegments = exercises.length * 2 - 1;

  // Animation principale
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 1) {
            clearInterval(interval);
            return 1;
          }
          return prev + 0.002;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Exercice ou repos selon la progression
  useEffect(() => {
    const segmentSize = 1 / totalSegments;

    for (let i = 0; i < totalSegments; i++) {
      const start = i * segmentSize;
      const end = (i + 1) * segmentSize;

      if (progress >= start && progress < end) {
        if (i % 2 === 1) {
          setCurrentExercise("Rest");
        } else {
          const exerciseIndex = Math.floor(i / 2);
          setCurrentExercise(exercises[exerciseIndex].title);
        }
        break;
      }
    }

    if (progress >= 1) {
      setCurrentExercise(exercises[exercises.length - 1].title);
    }
  }, [progress]);

  const getRestProgress = (index) => {
    const start = (index * 2 + 1) / totalSegments;
    const end = (index * 2 + 2) / totalSegments;
    if (progress <= start) return 0;
    if (progress >= end) return 1;
    return (progress - start) / (end - start);
  };

  const handlePlayPause = () => {
    if (progress >= 1) {
      setProgress(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  return (
    <View style={styles.container}>
      {/* --- HEADER --- */}
      <View style={styles.headerCard}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1594737625785-cbdb6993a47e?q=80&w=800",
          }}
          style={styles.headerImage}
        />

        <View style={styles.overlay}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Today's activities :</Text>
              <Text style={styles.headerSubtitle}>Body Weight</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.timeValue}>01:30 hr</Text>
              <Text style={styles.timeLabel}>Time</Text>
            </View>
          </View>

          {/* --- PLAY + TEXTE --- */}
          <View style={styles.playRow}>
            <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
              <Ionicons
                name={
                  progress >= 1
                    ? "refresh-circle"
                    : isPlaying
                    ? "pause"
                    : "play"
                }
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
            <Text style={styles.exerciseText}>{currentExercise}</Text>
          </View>

          {/* --- BARRE PRINCIPALE --- */}
          <Progress.Bar
            progress={progress}
            width={null}
            height={5}
            color="#A3FF3D"
            unfilledColor="#222"
            borderWidth={0}
            style={{ marginTop: 15 }}
          />
        </View>
      </View>

      {/* --- CIRCUIT HEADER --- */}
      <View style={styles.circuitHeader}>
        <Text style={styles.circuitTitle}>Circuit 1 : Beginner</Text>
        <View style={styles.setRow}>
          <Ionicons name="refresh-circle-outline" size={20} color="#000" />
          <Text style={styles.setText}>2 set</Text>
        </View>
      </View>

      {/* --- LISTE DES EXOS --- */}
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        extraData={progress}
        contentContainerStyle={{ paddingBottom: 60 }}
        renderItem={({ item, index }) => {
          const restProg = index < exercises.length - 1 ? getRestProgress(index) : 0;

          return (
            <View>
              {/* --- EXERCICE --- */}
              <View style={styles.exerciseCard}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseTitle}>{item.title}</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.type}</Text>
                </View>
              </View>

              {/* --- BARRE DE REPOS --- */}
              {index < exercises.length - 1 && (
                <View style={styles.restContainer}>
                  <View style={styles.restBarWrapper}>
                    <Text style={styles.restLabel}>3 min rest</Text>
                    <View style={styles.restBar}>
                      <View style={styles.restLine} />
                      <View
                        style={[
                          styles.restBarFill,
                          { width: `${restProg * 100}%` },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

/* --- STYLES --- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerCard: {
    height: 250, // ↑ plus grand
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: "hidden",
  },
  headerImage: { width: "100%", height: "100%" },
  overlay: {
    position: "absolute",
    inset: 0,
    padding: 25,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  headerSubtitle: { color: "#ddd", fontSize: 14 },
  timeValue: { color: "#fff", fontSize: 14, fontWeight: "600" },
  timeLabel: { color: "#bbb", fontSize: 12 },

  playRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  playButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    width: 40,
    height: 40,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
  },
  exerciseText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  circuitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    paddingHorizontal: 25,
  },
  circuitTitle: { fontSize: 19, fontWeight: "600", color: "#000" },
  setRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  setText: { fontSize: 15, color: "#333" },

  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 20, // ↑ plus grand
    borderRadius: 18,
    marginHorizontal: 25,
    marginTop: 18,
    elevation: 2,
    justifyContent: "space-between",
  },
  exerciseInfo: { flex: 1 },
  exerciseTitle: { fontSize: 17, fontWeight: "600", color: "#000" },
  tag: {
    backgroundColor: "#A3FF3D",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tagText: { fontSize: 13, fontWeight: "600", color: "#000" },

  restContainer: { marginTop: 15, marginHorizontal: 25 },
  restBarWrapper: { width: "100%" },
  restLabel: {
    color: "#222",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 5,
  },
  restBar: { position: "relative", height: 4 }, // ↑ épaissi
  restLine: {
    width: "100%",
    height: 3,
    backgroundColor: "#ccc",
    borderRadius: 2,
  },
  restBarFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 3,
    backgroundColor: "#A3FF3D",
    borderRadius: 2,
  },
});
