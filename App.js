import React, {
    useEffect,
    useState,
    createContext,
    useMemo,
} from 'react';

import {enableScreens} from 'react-native-screens';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, ActivityIndicator} from 'react-native';

import WelcomeScreenView from './screens/WelcomeScreenView';
import SignUpScreenView from './screens/SignUpScreenView';
import LoginScreenView from './screens/LoginScreenView';
import navview from './screens/navview';
import TrainingView from './screens/trainingview';
import StartScreen from './screens/StartScreenView';
import GenderScreenView from './screens/GenderScreenView';
import AgeScreenView from './screens/AgeScreenView';
import VerifyCodeScreenView from "./screens/VerifyCodeScreenView";

enableScreens();

const Stack = createNativeStackNavigator();

// 🔐 Contexte global d'authentification
export const AuthContext = createContext(null);

export default function App() {
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restauration du token au lancement de l'appli
    useEffect(() => {
        const restoreToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                if (storedToken) {
                    setToken(storedToken);
                }
            } catch (e) {
                console.log('Erreur lors du chargement du token :', e);
            } finally {
                setIsLoading(false);
            }
        };

        restoreToken();
    }, []);

    // Fonctions d'auth utilisables partout dans l'appli
    const authContext = useMemo(
        () => ({
            signIn: async (newToken) => {
                try {
                    await AsyncStorage.setItem('token', newToken);
                    setToken(newToken);
                } catch (e) {
                    console.log('Erreur lors de la sauvegarde du token :', e);
                }
            },
            signOut: async () => {
                try {
                    await AsyncStorage.removeItem('token');
                } catch (e) {
                    console.log('Erreur lors de la suppression du token :', e);
                } finally {
                    setToken(null);
                }
            },
            token,
        }),
        [token]
    );

    // Écran de chargement le temps de restaurer le token
    if (isLoading) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large"/>
            </View>
        );
    }

    return (
        <AuthContext.Provider value={authContext}>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    {token ? (
                        // ✅ Utilisateur connecté : navigation principale
                        <>
                            <Stack.Screen name="Nav" component={navview}/>
                            <Stack.Screen name="Training" component={TrainingView}/>
                        </>
                    ) : (
                        // 🚪 Utilisateur non connecté : onboarding / auth
                        <>
                            <Stack.Screen name="Welcome" component={WelcomeScreenView}/>
                            <Stack.Screen name="SignUp" component={SignUpScreenView}/>
                            <Stack.Screen name="Login" component={LoginScreenView}/>
                            <Stack.Screen name="Start" component={StartScreen}/>
                            <Stack.Screen name="Gender" component={GenderScreenView}/>
                            <Stack.Screen name="Age" component={AgeScreenView}/>
                            <Stack.Screen name="VerifyCode" component={VerifyCodeScreenView}/>

                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </AuthContext.Provider>
    );
}
