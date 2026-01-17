import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthContext from "../AuthContext";
import api from "../api/axiosInstance";

export default function GenderScreen({ navigation }) {
  const [selectedGender, setSelectedGender] = useState(null);
  const { token, setUser } = useContext(AuthContext);

  const handleContinue = async () => {
    if (!selectedGender) return;
    const sexeValue = selectedGender === "male" ? "masculin" : "feminin";

    try {
      const res = await api.put(
          "/users/me",
          { sexe: sexeValue },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );
      setUser(res.data);
      navigation.navigate("Age");
    } catch (e) {
      console.log("Erreur mise à jour sexe :", e?.response?.data || e.message);
    }
  };

  return (
      <ImageBackground
          source={require("../assets/welcome_page_pic.jpg")}
          style={styles.background}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Tell Us about Yourself</Text>
          <Text style={styles.subtitle}>
            To give you a better experience{"\n"}we need to know your gender
          </Text>

          <View style={styles.genderRow}>
            {/* Female */}
            <TouchableOpacity
                style={[
                  styles.genderButton,
                  selectedGender === "female" && styles.selectedFemale,
                ]}
                onPress={() => setSelectedGender("female")}
            >
              <Ionicons name="female" size={40} color="white" />
              <Text style={styles.genderLabel}>Female</Text>
            </TouchableOpacity>

            {/* Male */}
            <TouchableOpacity
                style={[
                  styles.genderButton,
                  selectedGender === "male" && styles.selectedMale,
                ]}
                onPress={() => setSelectedGender("male")}
            >
              <Ionicons name="male" size={40} color="white" />
              <Text style={styles.genderLabel}>Male</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleContinue}
              disabled={!selectedGender}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    alignItems: "center",
    gap: 20,
  },
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#ddd",
    textAlign: "center",
    marginBottom: 20,
  },
  genderRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 20,
  },
  genderButton: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  selectedMale: {
    backgroundColor: "#4CAF50",
  },
  selectedFemale: {
    backgroundColor: "#E91E63",
  },
  genderLabel: {
    color: "white",
    marginTop: 2 ,
    fontWeight: "bold",

  },
  continueBtn: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 30,
    top: 160,
  },
  continueText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
