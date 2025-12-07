import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
} from "react-native";

export default function GoalScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  const goals = [
    { id: 1, label: "Loose", icon: require("../assets/loose.png") },
    { id: 2, label: "Gain", icon: require("../assets/gain.png") },
  ];

  return (
    <ImageBackground
      source={require("../assets/welcome_page_pic.jpg")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>What is your goal?</Text>

        {/* OPTIONS */}
        <View style={styles.row}>
          {goals.map((item) => {
            const isSelected = selected === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.option,
                  isSelected ? styles.optionSelected : styles.optionDefault,
                ]}
                onPress={() => setSelected(item.id)}
              >
                <Image source={item.icon} style={styles.icon} />

                <Text
                  style={[
                    styles.optionLabel,
                    isSelected && styles.optionLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CONTINUE */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Equipment")} // à modifier plus tard
          disabled={selected === null}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "center" },
  container: { alignItems: "center" },

  title: {
    fontSize: 26,
    color: "white",
    marginBottom: 40,
    fontWeight: "bold",
  },

  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 25,
    marginBottom: 40,
  },

  option: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
  },

  optionDefault: {
    backgroundColor: "black",
  },

  optionSelected: {
    backgroundColor: "#9BE36A",
  },

  icon: {
    width: 60,
    height: 60,
    tintColor: "white",
    marginBottom: 10,
  },

  optionLabel: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },

  optionLabelSelected: {
    color: "white",
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 30,
    top: 160,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
