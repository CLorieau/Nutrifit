import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
} from "react-native";

export default function EquipmentScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  const options = [
    { id: 1, label: "None", icon: require("../assets/none-equipment.png") },
    { id: 2, label: "Gym", icon: require("../assets/gym.png") },
    { id: 3, label: "Basic", icon: require("../assets/basic.png") },
  ];

  return (
    <ImageBackground
      source={require("../assets/welcome_page_pic.jpg")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>What kind of equipment do you have?</Text>

        {/* FIRST ROW : None + Gym */}
        <View style={styles.row}>
          {options.slice(0, 2).map((item) => {
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

        {/* SECOND ROW : Basic */}
        <View style={styles.rowCenter}>
          {options.slice(2, 3).map((item) => {
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

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Nav")} // à modifier plus tard
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
    fontSize: 24,
    color: "white",
    textAlign: "center",
    marginBottom: 40,
    fontWeight: "bold",
    paddingHorizontal: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 25,
    marginBottom: 20,
  },

  rowCenter: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
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
    width: 55,
    height: 55,
    tintColor: "white",
    marginBottom: 10,
  },

  optionLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  optionLabelSelected: {
    color: "white",
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "white",
    paddingHorizontal: 50,
    paddingVertical: 12,
    borderRadius: 12,
    top: 70,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
