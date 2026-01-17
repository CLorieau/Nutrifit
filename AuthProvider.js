// AuthProvider.js
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthContext from "./AuthContext";
import api from "./api/axiosInstance";

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // Chargement du token + profil au démarrage de l’app
    useEffect(() => {
        const loadAuth = async () => {
            try {
                const storedToken = await AsyncStorage.getItem("token");
                if (!storedToken) {
                    setLoadingAuth(false);
                    return;
                }

                setToken(storedToken);

                // on laisse l’interceptor gérer le header, mais on force aussi sur axios global
                api.defaults.headers.Authorization = `Bearer ${storedToken}`;

                const res = await api.get("/users/me");
                setUser(res.data);
            } catch (e) {
                console.log(
                    "Erreur lors du chargement du profil au démarrage :",
                    e?.response?.data || e.message
                );
                await AsyncStorage.removeItem("token");
                setToken(null);
                setUser(null);
            } finally {
                setLoadingAuth(false);
            }
        };

        loadAuth();
    }, []);

    // appelé après un login réussi
    const signIn = async (accessToken) => {
        try {
            setToken(accessToken);
            await AsyncStorage.setItem("token", accessToken);
            api.defaults.headers.Authorization = `Bearer ${accessToken}`;

            // on récupère le profil de l’utilisateur connecté
            const res = await api.get("/users/me");
            setUser(res.data);
        } catch (e) {
            console.log(
                "Erreur lors du chargement du profil après login :",
                e?.response?.data || e.message
            );
            // on nettoie si le token est invalide
            await AsyncStorage.removeItem("token");
            setToken(null);
            setUser(null);
            throw e;
        }
    };

    const signOut = async () => {
        await AsyncStorage.removeItem("token");
        setToken(null);
        setUser(null);
        delete api.defaults.headers.Authorization;
    };

    const value = {
        token,
        user,
        setUser,    // utilisé dans GenderScreen, AgeScreen, etc.
        signIn,     // utilisé dans LoginScreen
        signOut,
        loadingAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
