import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
} from "react-native";

import AuthContext from "../AuthContext";
import api from "../api/axiosInstance";

export default function DietScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  const options = [
    { id: 1, label: "Vegetarian", icon: require("../assets/vegetarian.png") },
    { id: 2, label: "No pork", icon: require("../assets/no_pork.png") },
    { id: 3, label: "None", icon: require("../assets/none.png") },
  ];

  const { token, setUser } = useContext(AuthContext);

  const handleContinue = async () => {
    if (!selected) return;

    const option = options.find(o => o.id === selected);
    const regime_alimentaire = option?.label || option?.id;

    try {
      const res = await api.put(
          "/users/me",
          { regime_alimentaire },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );
      setUser(res.data);
      navigation.navigate("Goal");
    } catch (e) {
      console.log("Erreur mise à jour régime alimentaire :", e?.response?.data || e.message);
    }
  };


  return (
    <ImageBackground
      source={require("../assets/welcome_page_pic.jpg")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>What is your diet?</Text>

        {/* Choices */}
        {/* ROW 1 : Vegetarian + No pork */}
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

{/* ROW 2 : None */}
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


        {/* Continue */}
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
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
    marginBottom: 40,
    fontWeight: "bold",
  },

  choicesContainer: {
    gap: 20,
    alignItems: "center",
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
    backgroundColor: "#4CAF50",
  },

  icon: {
    width: 55,
    height: 55,
    marginBottom: 10,
    tintColor: "white",
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
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 30,
    top: 80,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    

  },
  row: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 20,
  marginBottom: 20,
},

rowCenter: {
  justifyContent: "center",
  alignItems: "center",
},

});
