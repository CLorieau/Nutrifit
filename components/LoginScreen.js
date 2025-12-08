import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { login } from '../api/auth';
import AuthContext from "../AuthContext";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erreur", "Veuillez entrer un email valide.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    try {
      setLoading(true);

      // 🔥 Appel API : POST /login
      const res = await login(email, password);    // res = réponse axios
      const accessToken = res.data?.access_token;  // res.data = JSON renvoyé par l'API

      if (!accessToken) {
        throw new Error("Token manquant dans la réponse.");
      }

      // ✅ On stocke le token via le contexte (qui lui gère AsyncStorage)
      await signIn(accessToken);

<<<<<<< HEAD

=======
>>>>>>> 347bde49dfb02e1f6cbc661f32cbd44f6bdc95f6
    } catch (error) {
      console.log(
          "Erreur login :",
          error?.response?.status,
          error?.response?.data || error
      );

      const status = error?.response?.status;

      if (status === 401) {
        Alert.alert("Erreur", "Email ou mot de passe incorrect.");
      } else if (status === 403) {
        Alert.alert(
            "Compte non vérifié",
            "Votre email n'a pas encore été vérifié. Veuillez vérifier vos emails."
        );
      } else if (status === 404) {
        Alert.alert("Erreur", "Utilisateur introuvable.");
      } else if (status === 422) {
        Alert.alert(
            "Erreur",
            "Les données envoyées ne sont pas valides (champ manquant ou mal nommé)."
        );
      } else {
        Alert.alert(
            "Erreur",
            "Impossible de vous connecter pour le moment. Veuillez réessayer."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <ImageBackground
          source={require('../assets/welcome_page_pic.jpg')}
          style={styles.background}
          resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Login</Text>

          <View style={styles.form}>
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

            <Text style={styles.pswrd}>
              Forgot Password?
            </Text>
          </View>

          <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
          >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footer}>
            Don’t have an account?{' '}
            <Text
                style={styles.login}
                onPress={() => navigation.navigate('SignUp')}
            >
              Sign Up
            </Text>
          </Text>
        </View>
      </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: 30,
    borderTopLeftRadius: 100,
    height: '70%',
    marginTop: 230,
  },
  title: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: 'black',
    paddingVertical: 12,
    borderRadius: 80,
    alignItems: 'center',
    marginTop: 60,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 15,
  },
  login: {
    color: 'white',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 30,
    marginTop: 40,
  },
  pswrd: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'right',
  },
});
