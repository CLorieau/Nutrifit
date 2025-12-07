import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function GenderScreen({ navigation }) {
  const [selectedGender, setSelectedGender] = useState(null);

  return (
    <ImageBackground
      source={require("../assets/welcome_page_pic.jpg")} // même image que la page précédente
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
            <Ionicons
              name="female"
              size={40}
              color={selectedGender === "female" ? "white" : "white"}
            />
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
            <Ionicons
              name="male"
              size={40}
              color={selectedGender === "male" ? "white" : "white"}
            />
            <Text style={styles.genderLabel}>Male</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate("Age")} // page suivante
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
