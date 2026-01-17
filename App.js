// App.js
import React, { useEffect, useState, useMemo } from "react";

import { enableScreens } from "react-native-screens";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

import WelcomeScreenView from "./screens/WelcomeScreenView";
import SignUpScreenView from "./screens/SignUpScreenView";
import LoginScreenView from "./screens/LoginScreenView";
import VerifyCodeScreenView from "./screens/VerifyCodeScreenView";
import navview from "./screens/navview";
import TrainingView from "./screens/trainingview";
import StartScreen from "./screens/StartScreenView";
import GenderScreenView from "./screens/GenderScreenView";
import AgeScreenView from "./screens/AgeScreenView";
import HeightScreenView from "./screens/HeightScreenView";
import WeightScreenView from "./screens/WeightScreenView";
import DietScreenView from "./screens/DietScreenView";
import GoalScreenView from "./screens/GoalScreenView";
import EquipmentScreenView from "./screens/EquipmentScreenView";

import AuthContext from "./AuthContext";
import { ChatProvider } from "./ChatContext";
import ChatModal from "./components/ChatModal";
import api from "./api/axiosInstance";

enableScreens();
const Stack = createNativeStackNavigator();

export default function App() {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);

    const [isLoadingToken, setIsLoadingToken] = useState(true);
    const [isLoadingUser, setIsLoadingUser] = useState(false);

    // 🔹 Restaure le token au lancement
    useEffect(() => {
        const restoreToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem("token");
                if (storedToken) {
                    console.log("🔑 Token restauré :", storedToken);
                    setToken(storedToken);
                    // on configure axios globalement
                    api.defaults.headers.Authorization = `Bearer ${storedToken}`;
                }
            } catch (e) {
                console.log("Erreur lors du chargement du token :", e);
            } finally {
                setIsLoadingToken(false);
            }
        };

        restoreToken();
    }, []);

    // 🔹 Charge le profil utilisateur quand on a un token
    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setUser(null);
                return;
            }

            setIsLoadingUser(true);
            try {
                console.log("📥 Récupération du profil avec le token :", token);
                // pas besoin de remettre les headers ici, axiosInstance + defaults s’en occupent
                const res = await api.get("/users/me");
                console.log("✅ Profil chargé :", res.data);
                setUser(res.data);
            } catch (e) {
                console.log(
                    "❌ Erreur lors du chargement du profil :",
                    e?.response?.status,
                    e?.response?.data || e.message
                );

                // Si le backend dit "Impossible de valider les identifiants" (401)
                if (e?.response?.status === 401) {
                    // on nettoie tout → retour à l’écran de login
                    await AsyncStorage.removeItem("token");
                    setToken(null);
                    setUser(null);
                    delete api.defaults.headers.Authorization;
                }
            } finally {
                setIsLoadingUser(false);
            }
        };

        fetchUser();
    }, [token]);

    // 🔹 Ce qui sera accessible via useContext(AuthContext)
    const authContext = useMemo(
        () => ({
            token,
            user,
            setUser,
            signIn: async (newToken) => {
                try {
                    console.log("🔐 signIn avec token :", newToken);
                    await AsyncStorage.setItem("token", newToken);
                    setToken(newToken);
                    api.defaults.headers.Authorization = `Bearer ${newToken}`;
                } catch (e) {
                    console.log("Erreur lors de la sauvegarde du token :", e);
                }
            },
            signOut: async () => {
                try {
                    await AsyncStorage.removeItem("token");
                    delete api.defaults.headers.Authorization;
                } catch (e) {
                    console.log("Erreur lors de la suppression du token :", e);
                } finally {
                    setToken(null);
                    setUser(null);
                }
            },
        }),
        [token, user]
    );

    // 🔹 Profil complet ?
    const isProfileComplete = !!(
        user &&
        user.sexe &&
        user.age &&
        user.poids_kg &&
        user.taille_cm &&
        user.regime_alimentaire &&
        user.objectif &&
        user.equipements
    );

    // 🔹 Pendant chargement token / user
    if (isLoadingToken || (token && isLoadingUser)) {
        return (
            <View
                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
            >
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <AuthContext.Provider value={authContext}>
            <SafeAreaProvider>
                <ChatProvider>
                    <NavigationContainer>
                        <Stack.Navigator screenOptions={{ headerShown: false }}>
                            {!token ? (
                                // 🔴 Utilisateur non connecté → Auth
                                <>
                                    <Stack.Screen name="Welcome" component={WelcomeScreenView} />
                                    <Stack.Screen name="SignUp" component={SignUpScreenView} />
                                    <Stack.Screen name="Login" component={LoginScreenView} />
                                    <Stack.Screen name="VerifyCode" component={VerifyCodeScreenView} />
                                </>
                            ) : !isProfileComplete ? (
                                // 🟡 Utilisateur connecté mais profil incomplet → Onboarding
                                <>
                                    <Stack.Screen name="Start" component={StartScreen} />
                                    <Stack.Screen name="Gender" component={GenderScreenView} />
                                    <Stack.Screen name="Age" component={AgeScreenView} />
                                    <Stack.Screen name="Height" component={HeightScreenView} />
                                    <Stack.Screen name="Weight" component={WeightScreenView} />
                                    <Stack.Screen name="Diet" component={DietScreenView} />
                                    <Stack.Screen name="Goal" component={GoalScreenView} />
                                    <Stack.Screen
                                        name="Equipment"
                                        component={EquipmentScreenView}
                                    />
                                </>
                            ) : (
                                // 🟢 Utilisateur connecté + profil complet → Dashboard
                                <>
                                    <Stack.Screen name="Nav" component={navview} />
                                    <Stack.Screen name="Training" component={TrainingView} />
                                </>
                            )}
                        </Stack.Navigator>
                    </NavigationContainer>
                    <ChatModal />
                </ChatProvider>
            </SafeAreaProvider>
        </AuthContext.Provider>
    );
}
