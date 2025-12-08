import React, {
    useEffect,
    useState,
<<<<<<< HEAD
    useMemo,
} from 'react';

import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
=======
    createContext,
    useMemo,
} from 'react';

import {enableScreens} from 'react-native-screens';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, ActivityIndicator} from 'react-native';
>>>>>>> 347bde49dfb02e1f6cbc661f32cbd44f6bdc95f6

import WelcomeScreenView from './screens/WelcomeScreenView';
import SignUpScreenView from './screens/SignUpScreenView';
import LoginScreenView from './screens/LoginScreenView';
import navview from './screens/navview';
import TrainingView from './screens/trainingview';
import StartScreen from './screens/StartScreenView';
import GenderScreenView from './screens/GenderScreenView';
import AgeScreenView from './screens/AgeScreenView';
import VerifyCodeScreenView from "./screens/VerifyCodeScreenView";
<<<<<<< HEAD
import HeightScreenView from './screens/HeightScreenView';
import WeightScreenView from './screens/WeightScreenView';
import DietScreenView from './screens/DietScreenView';
import GoalScreenView from './screens/GoalScreenView';
import EquipmentScreenView from './screens/EquipmentScreenView';
=======
>>>>>>> 347bde49dfb02e1f6cbc661f32cbd44f6bdc95f6

enableScreens();

const Stack = createNativeStackNavigator();

<<<<<<< HEAD
=======
// 🔐 Contexte global d'authentification
>>>>>>> 347bde49dfb02e1f6cbc661f32cbd44f6bdc95f6
import AuthContext from "./AuthContext";

export default function App() {
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

<<<<<<< HEAD
    // Restauration du token au lancement
=======
    // Restauration du token au lancement de l'appli
>>>>>>> 347bde49dfb02e1f6cbc661f32cbd44f6bdc95f6
    useEffect(() => {
        const restoreToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
<<<<<<< HEAD
                if (storedToken) setToken(storedToken);
=======
                if (storedToken) {
                    setToken(storedToken);
                }
            } catch (e) {
                console.log('Erreur lors du chargement du token :', e);
>>>>>>> 347bde49dfb02e1f6cbc661f32cbd44f6bdc95f6
            } finally {
                setIsLoading(false);
            }
        };
<<<<<<< HEAD
        restoreToken();
    }, []);

    // Fonctions du contexte
    const authContext = useMemo(() => ({
        signIn: async (newToken) => {
            await AsyncStorage.setItem('token', newToken);
            setToken(newToken);
        },
        signOut: async () => {
            await AsyncStorage.removeItem('token');
            setToken(null);
        },
        token,
    }), [token]);

    // Écran chargement
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
=======

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
>>>>>>> 347bde49dfb02e1f6cbc661f32cbd44f6bdc95f6
            </View>
        );
    }

    return (
        <AuthContext.Provider value={authContext}>
            <NavigationContainer>
<<<<<<< HEAD
                <Stack.Navigator screenOptions={{ headerShown: false }}>

                    {token ? (
                        // 🔵 UTILISATEUR CONNECTÉ → ONBOARDING + NAVIGATION
                        <>
                            {/* Onboarding */}
                            <Stack.Screen name="Start" component={StartScreen} />
                            <Stack.Screen name="Gender" component={GenderScreenView} />
                            <Stack.Screen name="Age" component={AgeScreenView} />
                            <Stack.Screen name="Height" component={HeightScreenView} />
                            <Stack.Screen name="Weight" component={WeightScreenView} />
                            <Stack.Screen name="Diet" component={DietScreenView} />
                            <Stack.Screen name="Goal" component={GoalScreenView} />
                            <Stack.Screen name="Equipment" component={EquipmentScreenView} />


                        


                            {/* Dashboard */}
                            <Stack.Screen name="Nav" component={navview} />
                            <Stack.Screen name="Training" component={TrainingView} />
                        </>
                    ) : (
                        // 🔴 UTILISATEUR NON CONNECTÉ → AUTHENTIFICATION
                        <>
                            <Stack.Screen name="Welcome" component={WelcomeScreenView} />
                            <Stack.Screen name="SignUp" component={SignUpScreenView} />
                            <Stack.Screen name="Login" component={LoginScreenView} />
                            <Stack.Screen name="VerifyCode" component={VerifyCodeScreenView} />
                        </>
                    )}

=======
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
>>>>>>> 347bde49dfb02e1f6cbc661f32cbd44f6bdc95f6
                </Stack.Navigator>
            </NavigationContainer>
        </AuthContext.Provider>
    );
}
