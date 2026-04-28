import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from "react-native";

import { signup } from "../api/auth";

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !lastName || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);

      await signup({
        prenom: fullName,
        nom: lastName,
        email: email,
        mot_de_passe: password,
      });

      Alert.alert(
          "Success",
          "Registration successful! A verification code has just been sent to you.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("VerifyCode", { email }),
            },
          ]
      );
    } catch (error) {
      console.log("Erreur inscription :", error?.response?.data || error);

      if (error?.response?.status === 400) {
        Alert.alert("Error", "This email is already in use.");
      } else {
        Alert.alert("Error", "Unable to register. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <ImageBackground
          source={require("../assets/welcome_page_pic.jpg")}
          style={styles.background}
          resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Sign Up</Text>

          <View style={styles.form}>
            <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#aaa"
                value={fullName}
                onChangeText={setFullName}
            />

            <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#aaa"
                value={lastName}
                onChangeText={setLastName}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#aaa"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Text style={styles.pswrd} onPress={() => navigation.goBack()}>
              Forget Password?
            </Text>
          </View>

          <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleSignUp}
              disabled={loading}
          >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footer}>
            Already have an account?{" "}
            <Text style={styles.login} onPress={() => navigation.navigate("Login")}>
              Login
            </Text>
          </Text>
        </View>
      </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
  },
  overlay: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    padding: 30,
    borderTopLeftRadius: 100,
    height: "78%",
    marginTop: 200,
  },
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "black",
    paddingVertical: 12,
    borderRadius: 80,
    alignItems: "center",
    marginTop: 88,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    color: "#ccc",
    textAlign: "center",
    marginTop: 15,
  },
  login: {
    color: "white",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 30,
    marginTop: 40,
  },
  pswrd: {
    color: "white",
    fontWeight: "bold",
    textAlign: "right",
    marginTop: -35,
  },
});
