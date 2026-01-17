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

export default function Dashboard({ navigation }) {
  const { openChat } = useChat();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Gestion de la progression automatique
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 1) {
            clearInterval(interval);
            setIsPlaying(false);
            return 1;
          }
          return prev + 0.0025;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Gestion du bouton play/pause/retry
  const handlePlayPause = () => {
    if (progress >= 1) {
      setProgress(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
    // Navigation vers TrainingDetail
    navigation.navigate("Dashboard", { screen: "TrainingDetail" });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>Logo</Text>
        <TouchableOpacity style={styles.addButton} onPress={openChat}>
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* CARD 1 — TRAINING */}
      <View style={styles.trainingCard}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1594737625785-cbdb6993a47e?q=80&w=800",
          }}
          style={styles.trainingImage}
        />
        <View style={styles.overlay}>
          {/* TITRES */}
          <View>
            <Text style={styles.trainingTitle}>Today's activities :</Text>
            <Text style={styles.trainingSubtitle}>Body Weight</Text>
          </View>

          {/* INFOS + PLAY + BARRE */}
          <View style={styles.infoContainer}>
            {/* Bouton Play/Pause/Retry */}
            <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
              {progress >= 1 ? (
                <Ionicons name="refresh" size={24} color="#fff" />
              ) : isPlaying ? (
                <Ionicons name="pause" size={24} color="#fff" />
              ) : (
                <Ionicons name="play" size={24} color="#fff" />
              )}
            </TouchableOpacity>

            {/* Bloc des infos */}
            <View style={{ flex: 1 }}>
              <View style={styles.infoBottom}>
                <View>
                  <Text style={styles.trainingValue}>430 kcal</Text>
                  <Text style={styles.trainingLabel}>Calories Burned</Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.trainingValue}>01:30 hr</Text>
                  <Text style={styles.trainingLabel}>Time</Text>
                </View>
              </View>

              {/* Barre de progression */}
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
              <Text style={styles.infoSub}>1300/2200 kcal</Text>
            </Text>
            <Text style={styles.infoText}>
              Calories burned{" "}
              <Text style={styles.infoSub}>0/430 kcal</Text>
            </Text>
          </View>

          <View style={styles.circleContainer}>
            <Progress.Circle
              size={100}
              progress={(2200 - 1300) / 2200}
              showsText={true}
              color="#A3FF3D"
              unfilledColor="#333"
              borderWidth={0}
              thickness={6}
              formatText={() => "300"}
            />
            <Text style={styles.remainingLabel}>Remaining</Text>
          </View>
        </View>
      </View>

      {/* CARD 3 — MEALS */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Meals of the day</Text>

        {["Breakfast", "Lunch", "Evening meal"].map((meal, index) => (
          <TouchableOpacity
            key={index}
            style={styles.mealCard}
            onPress={() =>
              navigation.navigate("Dashboard", { screen: "RecipeDetail" })
            }
          >
            <Image
              source={{
                uri:
                  index === 0
                    ? "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=1200"
                    : index === 1
                      ? "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200"
                      : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200",
              }}
              style={styles.mealImage}
            />
            <View style={styles.mealOverlay}>
              <View>
                <Text style={styles.mealTitle}>{meal}</Text>
                <Text style={styles.mealInfo}>
                  {index === 0
                    ? "15:00 min • 650 kcal"
                    : index === 1
                      ? "01:15 hr • 1650 kcal"
                      : "30 min • 900 kcal"}
                </Text>
              </View>
              <Ionicons name="search" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
        ))}
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
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
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
