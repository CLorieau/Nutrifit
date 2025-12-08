import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  FlatList,
} from "react-native";

export default function HeightScreen({ navigation }) {
  const heights = Array.from({ length: 91 }, (_, i) => i + 140); // 140–230 cm
  const ITEM_HEIGHT = 40;
  const VISIBLE_ITEMS = 5;

  const [selectedIndex, setSelectedIndex] = useState(22); // 162 cm par défaut

  const handleScroll = (e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    setSelectedIndex(index);
  };

  return (
    <ImageBackground
      source={require("../assets/welcome_page_pic.jpg")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>What is your Height ?</Text>

        <View style={styles.selectorWrapper}>
          {/* Petit rectangle blanc à gauche */}
          <View style={styles.pointer} />

          {/* LISTE des hauteurs */}
          <FlatList
            data={heights}
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
                  <Text
                    style={[styles.heightText, isSelected && styles.selectedHeight]}
                  >
                    {item}
                  </Text>
                </View>
              );
            }}
          />
        </View>

        {/* Bouton Continue */}
        <TouchableOpacity
          style={styles.button}
<<<<<<< HEAD
          onPress={() => navigation.navigate("Weight")}
=======
          onPress={() => navigation.navigate("Nav")}
>>>>>>> 347bde49dfb02e1f6cbc661f32cbd44f6bdc95f6
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
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 40,
    bottom:50,

  },

  selectorWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  pointer: {
    width: 20,
    height: 10,
    backgroundColor: "white",
    marginRight: 15,
    borderRadius: 3,
  },

  itemContainer: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  heightText: {
    fontSize: 22,
    color: "rgba(255,255,255,0.5)",
  },

  selectedHeight: {
    fontSize: 32,
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
    fontWeight: "bold",
    fontSize: 16,
  },
});
