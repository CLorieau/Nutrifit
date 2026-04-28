import react from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';//export default nous permet de rendre de composants utilisable par d'autres fichiers
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
    const navigation = useNavigation();
    return (
        <ImageBackground
            source={require('../assets/welcome_page_pic.jpg')}
            style={styles.background}
            resizeMode='cover'
        >
            {/* le view est comme une div en html ca sert a regrouper plusieurs éléments */}
            <View style={styles.overlay}>
                {/* on va créer un sous view pour le texte et le bouton et le lien de connexion, "content" est un nom de style pour centrer les éléments */}
                <View style={styles.content}>
                    <Text style={styles.titre}>Welcome.</Text>
                    <Text style={styles.subtitle}>
                        Meals tailored to your body, 
                        workouts designed for you.
                        All in one place
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                    <Text style={styles.footer}>
                        Already have an account? <Text style={styles.login} onPress={() => navigation.navigate('Login')}>
  Login
</Text>

                    </Text>
                </View>
            </View>
        </ImageBackground>
    );
}

//CSS

//StyleSheet.create permet de créer un objet de style pour les composants react native
//Style appliquéà l'image de fond
const styles = StyleSheet.create({
background:{
    flex: 1, //prend tout l'espace disponible
    justifyContent:'flex-end', 
},

//Couche noire transparente
overlay:{
    backgroundColor:'rgba(138, 135, 135, 0.5)',
    paddingHorizontal: 25,
    paddingVertical: 45,
    borderTopLeftRadius: 100,
    height:'40%',
    
},
//Conteneur principal du text et des boutons
content: {
    alignItems: 'left',
    gap:20,
   },
titre:{
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign:'left',
},

subtitle:{
color: '#ddd',
textAlign: 'left',
marginBottom: 30,

},

button:{
    backgroundColor: 'black',
    paddingVertical:12,
    paddingHorizontal: 40,
    marginBottom:20,
    alignSelf: 'center',
    width:'80%',
    borderRadius: 80,
},

buttonText:{
    color: 'white',
    fontSize:16,
    fontWeight: 'bold',
    textAlign: 'center',
},


login:{
    color: 'white',
    fontWeight: 'bold',
},
footer:{
textAlign:'center',
}
});
