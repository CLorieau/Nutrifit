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
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { signup } from "../api/auth";

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !lastName || !email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erreur", "Veuillez entrer un email valide.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Erreur",
        "Le mot de passe doit contenir au moins 6 caractères."
      );
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
        "Succès",
        "Inscription réussie ! Un code de vérification vient de vous être envoyé.",
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
        Alert.alert("Erreur", "Cet email est déjà utilisé.");
      } else {
        Alert.alert(
          "Erreur",
          "Impossible de vous inscrire. Merci de réessayer."
        );
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            extraHeight={150}
            extraScrollHeight={Platform.OS === "ios" ? 20 : 50}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View style={styles.spacer} />

            <View style={styles.overlay}>
              <Text style={styles.title}>Sign Up</Text>

              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#aaa"
                  value={fullName}
                  onChangeText={setFullName}
                  returnKeyType="next"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor="#aaa"
                  value={lastName}
                  onChangeText={setLastName}
                  returnKeyType="next"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#aaa"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="next"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#aaa"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
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
                <Text
                  style={styles.login}
                  onPress={() => navigation.navigate("Login")}
                >
                  Login
                </Text>
              </Text>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  spacer: {
    flex: 1,
    minHeight: 150,
  },
  overlay: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    padding: 30,
    borderTopLeftRadius: 100,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },
  form: {
    flexDirection: "column",
    marginTop: 40,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  pswrd: {
    color: "white",
    fontWeight: "bold",
    textAlign: "right",
    marginTop: -5,
  },
  button: {
    backgroundColor: "black",
    paddingVertical: 12,
    borderRadius: 80,
    alignItems: "center",
    marginTop: 40,
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
    marginBottom: 10,
  },
  login: {
    color: "white",
    fontWeight: "bold",
  },
});