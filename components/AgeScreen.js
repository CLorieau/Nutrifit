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

export default function AgeScreen({ navigation }) {
  const ages = Array.from({ length: 60 }, (_, i) => i + 12); // 12 → 71 ans
  const ITEM_HEIGHT = 40;
  const VISIBLE_ITEMS = 5;

  const [selectedIndex, setSelectedIndex] = useState(10); // valeur par défaut
  const { token, setUser } = useContext(AuthContext);

  const handleScroll = (e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const centerIndex = Math.round(offsetY / ITEM_HEIGHT);
    setSelectedIndex(centerIndex);
  };

  const handleContinue = async () => {
    const age = ages[selectedIndex];

    try {
      const res = await api.put(
          "/users/me",
          { age },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );
      setUser(res.data);
      navigation.navigate("Height");
    } catch (e) {
      console.log("Erreur mise à jour âge :", e?.response?.data || e.message);
    }
  };

  return (
      <ImageBackground
          source={require("../assets/welcome_page_pic.jpg")}
          style={styles.background}
      >
        <View style={styles.container}>
          <Text style={styles.title}>How old are you ?</Text>

          <FlatList
              data={ages}
              keyExtractor={(item) => item.toString()}
              style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
              contentContainerStyle={{
                paddingVertical: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2,
              }}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              initialScrollIndex={selectedIndex}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              renderItem={({ item, index }) => {
                const isSelected = index === selectedIndex;

                return (
                    <View style={styles.itemContainer}>
                      <Text style={[styles.age, isSelected && styles.selectedAge]}>
                        {item}
                      </Text>
                    </View>
                );
              }}
          />

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
    marginBottom: 30,
  },

  itemContainer: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  age: {
    fontSize: 22,
    color: "rgba(255,255,255,0.5)",
  },
  selectedAge: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "white",
    paddingHorizontal: 50,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 30,
  },

  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
