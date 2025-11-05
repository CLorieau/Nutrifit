import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ImageBackground, Alert } from 'react-native';

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = () => {
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
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    navigation.navigate('Nav');
  };

  return (
    <ImageBackground
      source={require('../assets/welcome_page_pic.jpg')}
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

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Already have an account?{' '}
          <Text style={styles.login} onPress={() => navigation.goBack()}>
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
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: 30,
    borderTopLeftRadius: 100,
    height: '78%',
    marginTop: 200,
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
    marginTop: 88,
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
    marginTop: -35,
  },
});