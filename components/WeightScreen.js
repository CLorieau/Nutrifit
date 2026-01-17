import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  FlatList,
} from "react-native";

import AuthContext from "../AuthContext";
import api from "../api/axiosInstance";

export default function WeightScreen({ navigation }) {
  const weights = Array.from({ length: 100 }, (_, i) => i + 30); // 30–129 kg
  const ITEM_WIDTH = 60;
  const VISIBLE_ITEMS = 5;

  const [selectedIndex, setSelectedIndex] = useState(30); // 60kg par défaut

  const handleScroll = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    setSelectedIndex(index);
  };

  const { token, setUser } = useContext(AuthContext);

  const handleContinue = async () => {
    const poids_kg = weights[selectedIndex];

    try {
      const res = await api.put(
          "/users/me",
          { poids_kg },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );
      setUser(res.data);
      navigation.navigate("Diet");
    } catch (e) {
      console.log("Erreur mise à jour poids :", e?.response?.data || e.message);
    }
  };


  return (
    <ImageBackground
      source={require("../assets/welcome_page_pic.jpg")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>what is your weight ?</Text>

        {/* Poids horizontal */}
        <FlatList
          data={weights}
          horizontal
          keyExtractor={(item) => item.toString()}
          style={{ width: ITEM_WIDTH * VISIBLE_ITEMS }}
          contentContainerStyle={{
            paddingHorizontal: (ITEM_WIDTH * (VISIBLE_ITEMS - 1)) / 2,
          }}
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          initialScrollIndex={selectedIndex}
          getItemLayout={(_, index) => ({
            length: ITEM_WIDTH,
            offset: ITEM_WIDTH * index,
            index,
          })}
          renderItem={({ item, index }) => {
            const isSelected = index === selectedIndex;

            return (
              <View style={styles.itemContainer}>
                <Text style={[styles.weight, isSelected && styles.selectedWeight]}>
                  {item}
                </Text>
              </View>
            );
          }}
        />

        {/* Flèche */}
        <Text style={styles.arrow}>▲</Text>

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
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 40,
    bottom:100,
  },

  itemContainer: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
  },

  weight: {
    fontSize: 24,
    color: "rgba(255,255,255,0.5)",
  },

  selectedWeight: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
  },

  arrow: {
    color: "white",
    fontSize: 20,
    marginTop: 10,
    marginBottom: 40,
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
    fontWeight: "bold",
    fontSize: 16,
  },
});
