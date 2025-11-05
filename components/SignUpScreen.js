import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ImageBackground } from 'react-native';

export default function SignUpScreen({ navigation }) {
  return (
    <ImageBackground
      source={require('../assets/welcome_page_pic.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Sign Up</Text>
        <View style={styles.form}>
        {/* Champs du formulaire */}
        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#aaa" />
        <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#aaa" />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#aaa" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#aaa" secureTextEntry />
                <Text style={styles.pswrd} onPress={() => navigation.goBack()}>
            Forget Password?
          </Text>
        </View>
        {/* Bouton d'inscription */}
        <TouchableOpacity style={styles.button}  onPress={() => navigation.navigate('Nav')}>
          <Text style={styles.buttonText} >Sign Up</Text>
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
    borderRadius:12 ,
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
  marginTop:40,
},
pswrd:{
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: -35,
},
});
