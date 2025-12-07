import React from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";

export default function StartScreen({ navigation }) {
  return (
    <ImageBackground
      source={require("../assets/welcome_page_pic.jpg")} // mets l'image de la fille ici
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.text}>Trouve le programme{"\n"}qui te convient</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Gender")}
        >
          <Text style={styles.buttonText}>Lance-toi !</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "flex-end" },
  container: { alignItems: "center", marginBottom: 80 },
  text: { color: "white", fontSize: 22, textAlign: "center", marginBottom: 20 },
  button: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: { color: "black", fontSize: 16, fontWeight: "bold" },
});
