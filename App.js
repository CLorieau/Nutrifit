import React, {
    useEffect,
    useState,
    useMemo,
} from 'react';

import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

import WelcomeScreenView from './screens/WelcomeScreenView';
import SignUpScreenView from './screens/SignUpScreenView';
import LoginScreenView from './screens/LoginScreenView';
import navview from './screens/navview';
import TrainingView from './screens/trainingview';
import StartScreen from './screens/StartScreenView';
import GenderScreenView from './screens/GenderScreenView';
import AgeScreenView from './screens/AgeScreenView';
import VerifyCodeScreenView from "./screens/VerifyCodeScreenView";
import HeightScreenView from './screens/HeightScreenView';
import WeightScreenView from './screens/WeightScreenView';
import DietScreenView from './screens/DietScreenView';
import GoalScreenView from './screens/GoalScreenView';
import EquipmentScreenView from './screens/EquipmentScreenView';

enableScreens();

const Stack = createNativeStackNavigator();

import AuthContext from "./AuthContext";

export default function App() {
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restauration du token au lancement
    useEffect(() => {
        const restoreToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                if (storedToken) setToken(storedToken);
            } finally {
                setIsLoading(false);
            }
        };
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
            </View>
        );
    }

    return (
        <AuthContext.Provider value={authContext}>
            <NavigationContainer>
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

                </Stack.Navigator>
            </NavigationContainer>
        </AuthContext.Provider>
    );
}
