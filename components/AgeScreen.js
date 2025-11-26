import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ImageBackground,
  TouchableOpacity,
} from "react-native";

export default function AgeScreen({ navigation }) {
  const ages = Array.from({ length: 60 }, (_, i) => i + 12);
  const ITEM_HEIGHT = 50;

  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <ImageBackground
      source={require("../assets/welcome_page_pic.jpg")}
      style={styles.background}
    >
      <View style={styles.container}>

        <Text style={styles.title}>How old are you ?</Text>

        {/* Picker container */}
        <View style={styles.pickerBox}>

          {/* Dégradé haut */}
          <View pointerEvents="none" style={styles.fadeTop} />

          {/* Liste scrollable */}
          <Animated.FlatList
            data={ages}
            keyExtractor={(item) => item.toString()}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            bounces={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 2) * ITEM_HEIGHT,
                (index - 1) * ITEM_HEIGHT,
                index * ITEM_HEIGHT,
                (index + 1) * ITEM_HEIGHT,
                (index + 2) * ITEM_HEIGHT,
              ];

              const opacity = scrollY.interpolate({
                inputRange,
                outputRange: [0.2, 0.5, 1, 0.5, 0.2],
                extrapolate: "clamp",
              });

              const scale = scrollY.interpolate({
                inputRange,
                outputRange: [0.8, 0.9, 1.3, 0.9, 0.8],
                extrapolate: "clamp",
              });

              return (
                <View style={styles.itemContainer}>
                  <Animated.Text
                    style={[
                      styles.age,
                      { opacity, transform: [{ scale }] }
                    ]}
                  >
                    {item}
                  </Animated.Text>
                </View>
              );
            }}
          />

          {/* Dégradé bas */}
          <View pointerEvents="none" style={styles.fadeBottom} />

        </View>

        {/* Continue */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("NextStep")}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "center" },
  container: { alignItems: "center", marginTop: -40 },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
  },

  pickerBox: {
    height: 200,
    width: 200,
    overflow: "hidden",
  },

  itemContainer: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  age: {
    fontSize: 26,
    color: "white",
  },

  fadeTop: {
    position: "absolute",
    top: 0,
    height: 50,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 10,
  },

  fadeBottom: {
    position: "absolute",
    bottom: 0,
    height: 50,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 10,
  },

  button: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 12,
    marginTop: 40,
  },

  buttonText: { fontWeight: "bold", fontSize: 16 },
});
